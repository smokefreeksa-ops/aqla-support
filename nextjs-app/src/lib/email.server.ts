import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

const region = process.env.AWS_REGION || 'eu-west-2'
const ses = new SESv2Client({ region })

const FROM_EMAIL = process.env.AQLA_SES_FROM || 'Aqla <noreply@smokefreeksa.com>'
const CONFIGURATION_SET = process.env.AQLA_SES_CONFIGURATION_SET || 'aqla-transactional'
const APP_URL = (process.env.AQLA_APP_URL || 'https://staging.smokefreeksa.com').replace(/\/$/, '')

export async function sendPlanReadyEmail({
  to,
  planId,
  lang,
}: {
  to: string
  planId: string
  lang: 'ar' | 'en'
}): Promise<{ messageId?: string }> {
  const planUrl = `${APP_URL}/aqla/plan/${encodeURIComponent(planId)}?lang=${lang}`

  const subject = lang === 'ar' ? 'خطتك مع أقلع جاهزة' : 'Your Aqla plan is ready'

  const text = [
    'أهلًا بك في أقلع،',
    '',
    'تم إنشاء وحفظ خطتك الشخصية بنجاح. حفاظًا على خصوصيتك، لا نعرض تفاصيل خطتك الصحية داخل البريد الإلكتروني.',
    'افتح خطتك بأمان من خلال الرابط التالي، وسجّل الدخول إلى حسابك إذا طُلب منك ذلك:',
    planUrl,
    '',
    'ستصلك رسائل المتابعة من أقلع وفق رحلة الدعم المخصصة لك.',
    '',
    '— أقلع | SmokefreeKSA',
    '',
    'Your personalised Aqla plan has been created and saved. For privacy, plan details are not included in this email.',
    `Open your plan securely: ${planUrl}`,
  ].join('\n')

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <body style="margin:0;background:#f4f7f5;font-family:Arial,'Noto Sans Arabic',sans-serif;color:#173b31;">
    <div style="max-width:620px;margin:0 auto;padding:32px 18px;">
      <div style="background:#ffffff;border-radius:18px;padding:30px;border:1px solid #e3ebe7;">
        <div style="font-size:28px;font-weight:700;margin-bottom:18px;">أقلع <span style="font-size:16px;font-weight:400;color:#557268;">Aqla</span></div>
        <h1 style="font-size:24px;margin:0 0 14px;">خطتك الشخصية جاهزة</h1>
        <p style="font-size:16px;line-height:1.9;margin:0 0 12px;">تم إنشاء وحفظ خطتك الشخصية بنجاح.</p>
        <p style="font-size:15px;line-height:1.9;margin:0 0 24px;color:#4d665e;">حفاظًا على خصوصيتك، لا نعرض تفاصيل خطتك الصحية داخل البريد الإلكتروني. افتحها بأمان بعد تسجيل الدخول إلى حسابك.</p>
        <p style="margin:28px 0;text-align:center;">
          <a href="${planUrl}" style="display:inline-block;background:#0f5132;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:16px;font-weight:700;">افتح خطتك مع أقلع</a>
        </p>
        <p style="font-size:14px;line-height:1.8;color:#5f766e;margin:24px 0 0;">ستصلك رسائل المتابعة من أقلع وفق رحلة الدعم المخصصة لك.</p>
        <hr style="border:0;border-top:1px solid #e5ece8;margin:26px 0;" />
        <div dir="ltr" style="text-align:left;color:#536c63;">
          <strong>Your Aqla plan is ready.</strong>
          <p style="font-size:14px;line-height:1.7;">For privacy, your plan details are not included in this email. Use the secure button above to return to your saved plan.</p>
        </div>
        <div style="margin-top:24px;font-size:13px;color:#7a8d86;">أقلع | SmokefreeKSA</div>
      </div>
    </div>
  </body>
</html>`

  const response = await ses.send(new SendEmailCommand({
    FromEmailAddress: FROM_EMAIL,
    Destination: { ToAddresses: [to] },
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
