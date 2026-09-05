import * as React from 'react'

import {
  AqlaAuthLayout,
  AqlaButton,
  ArText,
  EnText,
  fallbackStyle,
} from './_aqla-auth-layout'
import { Text } from '@react-email/components'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <AqlaAuthLayout
    preview="رابط الدخول إلى منصة أقلع"
    headingAr="رابط الدخول الخاص بك"
    headingEn="Your sign-in link"
  >
    <ArText>
      مرحبًا بك في أقلع. اضغط على الزر أدناه لتسجيل الدخول إلى حسابك. هذا الرابط
      صالح لفترة قصيرة ويُستخدم مرة واحدة فقط.
    </ArText>
    <AqlaButton href={confirmationUrl} labelAr="تسجيل الدخول" labelEn="Sign in" />
    <EnText>
      Click the button above to sign in to Aqla. The link expires shortly and can
      be used once.
    </EnText>
    <Text style={fallbackStyle}>{confirmationUrl}</Text>
    <ArText>إذا لم تطلب هذا الرابط، يمكنك تجاهل هذه الرسالة بأمان.</ArText>
    <EnText>If you didn't request this link, you can safely ignore this email.</EnText>
  </AqlaAuthLayout>
)

export default MagicLinkEmail
