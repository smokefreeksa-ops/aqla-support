import * as React from 'react'

import {
  AqlaAuthLayout,
  AqlaButton,
  ArText,
  EnText,
  fallbackStyle,
} from './_aqla-auth-layout'
import { Text } from '@react-email/components'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ confirmationUrl }: SignupEmailProps) => (
  <AqlaAuthLayout
    preview="أكمل تسجيلك في منصة أقلع"
    headingAr="أكمل تسجيلك في أقلع"
    headingEn="Confirm your email"
  >
    <ArText>
      شكرًا لانضمامك إلى أقلع. اضغط على الزر أدناه لتأكيد بريدك الإلكتروني وبدء
      رحلتك في الإقلاع.
    </ArText>
    <AqlaButton href={confirmationUrl} labelAr="تأكيد البريد" labelEn="Confirm email" />
    <EnText>
      Click the button above to confirm your email address and start using Aqla.
    </EnText>
    <Text style={fallbackStyle}>{confirmationUrl}</Text>
    <ArText>إذا لم تنشئ هذا الحساب، يمكنك تجاهل هذه الرسالة.</ArText>
    <EnText>If you didn't create this account, you can ignore this email.</EnText>
  </AqlaAuthLayout>
)

export default SignupEmail
