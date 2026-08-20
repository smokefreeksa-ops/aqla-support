import { CreateScheduleCommand, SchedulerClient } from '@aws-sdk/client-scheduler'
import { markFollowupScheduleState, type FollowupType } from '@/lib/quit-engine/store.server'
import type { StoredQuitPlan } from '@/lib/quit-engine/types'

const region = process.env.AWS_REGION || 'eu-west-2'
const scheduler = new SchedulerClient({ region })

const accountId = process.env.AQLA_AWS_ACCOUNT_ID || '150252718453'
const groupName = process.env.AQLA_FOLLOWUP_SCHEDULER_GROUP || 'aqla-v2-staging-followups'
const workerArn = process.env.AQLA_FOLLOWUP_LAMBDA_ARN || `arn:aws:lambda:${region}:${accountId}:function:aqla-v2-staging-followup-worker`
const schedulerRoleArn = process.env.AQLA_FOLLOWUP_SCHEDULER_ROLE_ARN || `arn:aws:iam::${accountId}:role/aqla-v2-staging-followup-scheduler-invoke`
const deadLetterQueueArn = process.env.AQLA_FOLLOWUP_DLQ_ARN || `arn:aws:sqs:${region}:${accountId}:aqla-v2-staging-followup-dlq`

type ScheduleResult = {
  followup_type: FollowupType
  schedule_name: string
  status: 'scheduled' | 'failed'
}

function scheduleName(planId: string, type: FollowupType) {
  return `aqla-${planId}-${type.replaceAll('_', '-')}`
}

function atExpression(iso: string) {
  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) throw new Error('invalid_followup_time')
  return `at(${value.toISOString().replace(/\.\d{3}Z$/, '')})`
}

export async function schedulePlanFollowups({
  userSub,
  plan,
}: {
  userSub: string
  plan: StoredQuitPlan
}): Promise<{ status: 'scheduled' | 'partial' | 'failed'; results: ScheduleResult[] }> {
  const results: ScheduleResult[] = []

  for (const item of plan.result.follow_up_schedule) {
    const type = item.type as FollowupType
    const scheduledAt = new Date(new Date(plan.created_at).getTime() + item.offset_days * 86400000).toISOString()
    const name = scheduleName(plan.plan_id, type)

    try {
      await scheduler.send(new CreateScheduleCommand({
        Name: name,
        GroupName: groupName,
        Description: `Aqla ${type} follow-up for saved plan ${plan.plan_id}`,
        ScheduleExpression: atExpression(scheduledAt),
        ScheduleExpressionTimezone: 'UTC',
        FlexibleTimeWindow: { Mode: 'OFF' },
        ActionAfterCompletion: 'DELETE',
        State: 'ENABLED',
        ClientToken: name,
        Target: {
          Arn: workerArn,
          RoleArn: schedulerRoleArn,
          DeadLetterConfig: { Arn: deadLetterQueueArn },
          Input: JSON.stringify({
            userSub,
            planId: plan.plan_id,
            followupType: type,
            scheduledAt,
          }),
          RetryPolicy: {
            MaximumEventAgeInSeconds: 86400,
            MaximumRetryAttempts: 5,
          },
        },
      }))

      await markFollowupScheduleState({
        userSub,
        planId: plan.plan_id,
        followupType: type,
        status: 'scheduled',
        scheduleName: name,
      })
      results.push({ followup_type: type, schedule_name: name, status: 'scheduled' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_scheduler_error'
      console.error(`Aqla ${type} follow-up scheduling unavailable`, message)

      try {
        await markFollowupScheduleState({
          userSub,
          planId: plan.plan_id,
          followupType: type,
          status: 'schedule_failed',
          errorMessage: message,
        })
      } catch (markError) {
        console.error('Aqla follow-up schedule state could not be recorded', markError instanceof Error ? markError.message : 'unknown')
      }
      results.push({ followup_type: type, schedule_name: name, status: 'failed' })
    }
  }

  const scheduledCount = results.filter((item) => item.status === 'scheduled').length
  return {
    status: scheduledCount === results.length ? 'scheduled' : scheduledCount > 0 ? 'partial' : 'failed',
    results,
  }
}
