import * as React from 'react'

import {
  AqlaAuthLayout,
  AqlaButton,
  ArText,
  EnText,
  fallbackStyle,
} from './_aqla-auth-layout'
import { Text } from '@react-email/components'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address; newEmail is the requested one.
  oldEmail: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <AqlaAuthLayout
    preview="تأكيد تغيير البريد الإلكتروني في أقلع"
    headingAr="تأكيد بريدك الإلكتروني الجديد"
    headingEn="Confirm your new email"
  >
    <ArText>
      وصلنا طلب لتغيير البريد الإلكتروني لحسابك في أقلع من {oldEmail} إلى{' '}
      {newEmail}. اضغط على الزر أدناه لتأكيد التغيير.
    </ArText>
    <AqlaButton href={confirmationUrl} labelAr="تأكيد التغيير" labelEn="Confirm change" />
    <EnText>
      Confirm the change of your Aqla account email from {oldEmail} to {newEmail}.
    </EnText>
    <Text style={fallbackStyle}>{confirmationUrl}</Text>
    <ArText>إذا لم تطلب هذا التغيير، تجاهل الرسالة ولن يتم تغيير أي شيء.</ArText>
    <EnText>If you didn't request this change, ignore this email and nothing changes.</EnText>
  </AqlaAuthLayout>
)

export default EmailChangeEmail
