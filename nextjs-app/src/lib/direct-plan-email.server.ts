import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { getOrCreateEmailPreference } from '@/lib/communication-preferences.server'

const region = process.env.AWS_REGION || 'eu-west-2'
const ses = new SESv2Client({ region })

const FROM_EMAIL = process.env.AQLA_SES_FROM || 'Aqla <noreply@smokefreeksa.com>'
const REPLY_TO_EMAIL = process.env.AQLA_SES_REPLY_TO || 'smokefreeksa@gmail.com'
const CONFIGURATION_SET = process.env.AQLA_SES_CONFIGURATION_SET || 'aqla-transactional'

export type DirectPlanEmailPayload = {
  to: string
  name: string
  lang: 'ar' | 'en'
  plan: {
    title: string
    summary?: string
    personal_summary?: string
    first_step: string
    seventy_two_hour_plan: string[]
    seven_day_plan: Array<{ day: number; task: string }>
    craving_card?: string
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function listHtml(items: string[]) {
  return items.map((item) => `<li style="margin:0 0 8px 0;">${escapeHtml(item)}</li>`).join('')
}

export async function sendDirectPlanEmail(payload: DirectPlanEmailPayload): Promise<{ messageId?: string }> {
  const preference = await getOrCreateEmailPreference(payload.to)
  if (preference.global_suppressed) throw new Error(`email_suppressed_${preference.suppression_reason || 'global'}`)

  const ar = payload.lang === 'ar'
  const subject = ar ? `خطتك مع أقلع جاهزة، ${payload.name}` : `Your Aqla plan is ready, ${payload.name}`
  const plan72 = payload.plan.seventy_two_hour_plan.slice(0, 6)
  const plan7 = payload.plan.seven_day_plan.slice(0, 7)
  const summary = payload.plan.personal_summary || payload.plan.summary || ''

  const text = ar
    ? [
        `مرحبًا ${payload.name}،`,
        '',
        'كما طلبت، هذه نسخة مباشرة من خطتك التي أنشأها أقلع.',
        '',
        payload.plan.title,
        summary,
        '',
        'أول خطوة خلال 24 ساعة:',
        payload.plan.first_step,
        '',
        'خطة 72 ساعة:',
        ...plan72.map((item) => `- ${item}`),
        '',
        'خطة 7 أيام:',
        ...plan7.map((item) => `- اليوم ${item.day}: ${item.task}`),
        ...(payload.plan.craving_card ? ['', 'بطاقة الرغبة:', payload.plan.craving_card] : []),
        '',
        'تنبيه: أقلع أداة دعم رقمية قيد التطوير وليست بديلاً عن التقييم أو المشورة الطبية. قد يخطئ النظام أو تكون بعض النتائج غير مكتملة.',
        '',
        'أُرسل هذا البريد لأنك طلبت إرسال خطتك إلى هذا العنوان. هذا لا يشترك بك تلقائيًا في رسائل المتابعة.',
        '— أقلع | Aqla | SmokefreeKSA',
      ].join('\n')
    : [
        `Hello ${payload.name},`,
        '',
        'As requested, here is a direct copy of the plan you generated with Aqla.',
        '',
        payload.plan.title,
        summary,
        '',
        'Your first step in the next 24 hours:',
        payload.plan.first_step,
        '',
        'Your 72-hour plan:',
        ...plan72.map((item) => `- ${item}`),
        '',
        'Your 7-day plan:',
        ...plan7.map((item) => `- Day ${item.day}: ${item.task}`),
        ...(payload.plan.craving_card ? ['', 'Craving card:', payload.plan.craving_card] : []),
        '',
        'Notice: Aqla is a digital support tool under development and is not a substitute for medical assessment or advice. The system can make mistakes and some results may be incomplete.',
        '',
        'This email was sent because you asked Aqla to send your generated plan to this address. It does not automatically enrol you in follow-up emails.',
        '— Aqla | SmokefreeKSA',
      ].join('\n')

  const title = escapeHtml(payload.plan.title)
  const safeName = escapeHtml(payload.name)
  const safeSummary = escapeHtml(summary)
  const firstStep = escapeHtml(payload.plan.first_step)
  const craving = payload.plan.craving_card ? escapeHtml(payload.plan.craving_card) : ''
  const dayItems = plan7.map((item) => `<li style="margin:0 0 8px 0;"><strong>${ar ? `اليوم ${item.day}` : `Day ${item.day}`}:</strong> ${escapeHtml(item.task)}</li>`).join('')

  const html = `<!doctype html>
<html lang="${ar ? 'ar' : 'en'}" dir="${ar ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f6f4;color:#173b31;font-family:Arial,Tahoma,sans-serif;direction:${ar ? 'rtl' : 'ltr'};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f6f4"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #dfe9e4;border-radius:18px;overflow:hidden;">
<tr><td style="padding:28px 30px 10px 30px;"><div style="font-size:28px;font-weight:700;color:#0f5132;">${ar ? 'أقلع' : 'Aqla'}</div></td></tr>
<tr><td style="padding:8px 30px 0 30px;"><h1 style="margin:0;font-size:24px;line-height:1.5;color:#173b31;">${ar ? `مرحبًا ${safeName}، خطتك جاهزة` : `Hello ${safeName}, your plan is ready`}</h1></td></tr>
<tr><td style="padding:14px 30px 0 30px;font-size:15px;line-height:1.85;color:#39584f;">${ar ? 'كما طلبت، هذه نسخة مباشرة من خطتك التي أنشأها أقلع.' : 'As requested, this is a direct copy of the plan you generated with Aqla.'}</td></tr>
<tr><td style="padding:22px 30px 0 30px;"><div style="border-radius:14px;background:#eef7f2;border:1px solid #d7e9df;padding:18px;"><strong style="display:block;font-size:18px;color:#0f5132;">${title}</strong>${safeSummary ? `<p style="margin:9px 0 0 0;line-height:1.8;color:#39584f;">${safeSummary}</p>` : ''}</div></td></tr>
<tr><td style="padding:22px 30px 0 30px;"><h2 style="font-size:17px;color:#173b31;">${ar ? 'أول خطوة خلال 24 ساعة' : 'Your first step in the next 24 hours'}</h2><p style="line-height:1.85;color:#39584f;">${firstStep}</p></td></tr>
<tr><td style="padding:10px 30px 0 30px;"><h2 style="font-size:17px;color:#173b31;">${ar ? 'خطة 72 ساعة' : 'Your 72-hour plan'}</h2><ul style="padding-${ar ? 'right' : 'left'}:20px;line-height:1.75;color:#39584f;">${listHtml(plan72)}</ul></td></tr>
<tr><td style="padding:10px 30px 0 30px;"><h2 style="font-size:17px;color:#173b31;">${ar ? 'خطة 7 أيام' : 'Your 7-day plan'}</h2><ol style="padding-${ar ? 'right' : 'left'}:20px;line-height:1.75;color:#39584f;">${dayItems}</ol></td></tr>
${craving ? `<tr><td style="padding:10px 30px 0 30px;"><div style="border-inline-start:4px solid #c9a84c;background:#fbf7e9;border-radius:10px;padding:14px 16px;line-height:1.8;color:#4f4936;"><strong>${ar ? 'بطاقة الرغبة' : 'Craving card'}</strong><br>${craving}</div></td></tr>` : ''}
<tr><td style="padding:24px 30px 10px 30px;"><div style="height:1px;background:#e4ece8;"></div></td></tr>
<tr><td style="padding:12px 30px 28px 30px;font-size:12px;line-height:1.8;color:#6d8179;">${ar ? 'تنبيه: أقلع أداة دعم رقمية قيد التطوير وليست بديلاً عن التقييم أو المشورة الطبية. قد يخطئ النظام أو تكون بعض النتائج غير مكتملة.' : 'Notice: Aqla is a digital support tool under development and is not a substitute for medical assessment or advice. The system can make mistakes and some results may be incomplete.'}<br><br>${ar ? 'أُرسل هذا البريد لأنك طلبت إرسال خطتك إلى هذا العنوان. هذا لا يشترك بك تلقائيًا في رسائل المتابعة.' : 'This email was sent because you asked Aqla to send your generated plan to this address. It does not automatically enrol you in follow-up emails.'}</td></tr>
</table></td></tr></table></body></html>`

  const response = await ses.send(new SendEmailCommand({
    FromEmailAddress: FROM_EMAIL,
    ReplyToAddresses: [REPLY_TO_EMAIL],
    Destination: { ToAddresses: [payload.to] },
    ConfigurationSetName: CONFIGURATION_SET,
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: text, Charset: 'UTF-8' },
          Html: { Data: html, Charset: 'UTF-8' },
        },
      },
    },
  }))

  return { messageId: response.MessageId }
}
