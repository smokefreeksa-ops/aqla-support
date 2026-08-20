import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

const region = process.env.AWS_REGION || 'eu-west-2'
const ses = new SESv2Client({ region })

const FROM_EMAIL = process.env.AQLA_SES_FROM || 'Aqla <noreply@smokefreeksa.com>'
const REPLY_TO_EMAIL = process.env.AQLA_SES_REPLY_TO || 'smokefreeksa@gmail.com'
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
    'تم إنشاء وحفظ خطتك الشخصية بنجاح.',
    'حفاظًا على خصوصيتك، لا نعرض تفاصيل خطتك الصحية داخل البريد الإلكتروني.',
    'افتح خطتك بأمان من خلال الرابط التالي، وسجّل الدخول إلى حسابك إذا طُلب منك ذلك:',
    planUrl,
    '',
    'ستصلك رسائل المتابعة من أقلع وفق رحلة الدعم المخصصة لك.',
    'يمكنك الرد على هذا البريد للاستفسارات غير العاجلة.',
    '',
    '— أقلع | Aqla | SmokefreeKSA',
    '',
    'Your personalised Aqla plan has been created and saved.',
    'For privacy, plan details are not included in this email.',
    `Open your plan securely: ${planUrl}`,
  ].join('\n')

  // Email clients do not apply RTL CSS consistently. Use presentation tables plus
  // explicit direction/alignment on every Arabic content cell so Gmail, Apple Mail
  // and Outlook-style clients retain a genuinely right-to-left reading experience.
  const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${subject}</title>
  </head>
  <body dir="rtl" style="margin:0;padding:0;background:#f3f6f4;color:#173b31;font-family:Arial,'Noto Sans Arabic',Tahoma,sans-serif;direction:rtl;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">تم إنشاء وحفظ خطتك الشخصية مع أقلع. افتحها بأمان من حسابك.</div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f6f4" style="width:100%;border-collapse:collapse;background:#f3f6f4;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;border-collapse:separate;background:#ffffff;border:1px solid #dfe9e4;border-radius:18px;overflow:hidden;">
            <tr>
              <td dir="rtl" align="right" style="direction:rtl;text-align:right;padding:30px 30px 10px 30px;">
                <div style="font-size:28px;line-height:1.25;font-weight:700;color:#0f5132;text-align:right;direction:rtl;">أقلع <span dir="ltr" style="font-size:15px;font-weight:500;color:#62776f;">Aqla</span></div>
              </td>
            </tr>

            <tr>
              <td dir="rtl" align="right" style="direction:rtl;text-align:right;padding:12px 30px 0 30px;">
                <h1 style="margin:0;font-size:25px;line-height:1.55;font-weight:700;color:#173b31;text-align:right;direction:rtl;">خطتك الشخصية جاهزة</h1>
              </td>
            </tr>

            <tr>
              <td dir="rtl" align="right" style="direction:rtl;text-align:right;padding:16px 30px 0 30px;font-size:16px;line-height:1.95;color:#26483e;">
                <p dir="rtl" align="right" style="margin:0 0 10px 0;text-align:right;direction:rtl;">تم إنشاء وحفظ خطتك الشخصية بنجاح.</p>
                <p dir="rtl" align="right" style="margin:0;text-align:right;direction:rtl;color:#506a61;">حفاظًا على خصوصيتك، لا نعرض تفاصيل خطتك الصحية داخل البريد الإلكتروني. افتح خطتك بأمان بعد تسجيل الدخول إلى حسابك إذا طُلب منك ذلك.</p>
              </td>
            </tr>

            <tr>
              <td dir="rtl" align="right" style="direction:rtl;text-align:right;padding:26px 30px 8px 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="right" style="border-collapse:separate;">
                  <tr>
                    <td bgcolor="#0f5a3a" style="border-radius:10px;text-align:center;">
                      <a href="${planUrl}" dir="rtl" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:16px;line-height:1.2;font-weight:700;text-align:center;white-space:nowrap;">افتح خطتك مع أقلع</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td dir="rtl" align="right" style="direction:rtl;text-align:right;padding:18px 30px 26px 30px;font-size:14px;line-height:1.9;color:#5b7169;">
                <p dir="rtl" align="right" style="margin:0 0 7px 0;text-align:right;direction:rtl;">ستصلك رسائل المتابعة من أقلع وفق رحلة الدعم المخصصة لك.</p>
                <p dir="rtl" align="right" style="margin:0;text-align:right;direction:rtl;">للاستفسارات غير العاجلة، يمكنك الرد مباشرة على هذا البريد.</p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 30px;">
                <div style="height:1px;line-height:1px;background:#e4ece8;font-size:1px;">&nbsp;</div>
              </td>
            </tr>

            <tr>
              <td dir="ltr" align="left" style="direction:ltr;text-align:left;padding:24px 30px 12px 30px;color:#506a61;font-family:Arial,sans-serif;">
                <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;font-weight:700;color:#274c40;text-align:left;">Your Aqla plan is ready.</p>
                <p style="margin:0;font-size:14px;line-height:1.7;text-align:left;">For privacy, your plan details are not included in this email. Use the secure button above to return to your saved plan.</p>
              </td>
            </tr>

            <tr>
              <td dir="rtl" align="right" style="direction:rtl;text-align:right;padding:12px 30px 28px 30px;font-size:12px;line-height:1.7;color:#7a8c85;">
                <span dir="rtl">أقلع</span> <span dir="ltr">| Aqla | SmokefreeKSA</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const response = await ses.send(new SendEmailCommand({
    FromEmailAddress: FROM_EMAIL,
    ReplyToAddresses: [REPLY_TO_EMAIL],
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
