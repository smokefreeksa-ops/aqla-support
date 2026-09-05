import * as React from 'react'

import {
  AqlaAuthLayout,
  AqlaButton,
  ArText,
  EnText,
  fallbackStyle,
} from './_aqla-auth-layout'
import { Text } from '@react-email/components'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <AqlaAuthLayout
    preview="دعوة للانضمام إلى منصة أقلع"
    headingAr="لقد تمت دعوتك إلى أقلع"
    headingEn="You've been invited to Aqla"
  >
    <ArText>
      تمت دعوتك للانضمام إلى منصة أقلع لدعم الإقلاع عن التدخين. اضغط على الزر
      أدناه لقبول الدعوة وتفعيل حسابك.
    </ArText>
    <AqlaButton href={confirmationUrl} labelAr="قبول الدعوة" labelEn="Accept invitation" />
    <EnText>Click the button above to accept the invitation and activate your account.</EnText>
    <Text style={fallbackStyle}>{confirmationUrl}</Text>
    <ArText>إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل الرسالة.</ArText>
    <EnText>If you weren't expecting this invitation, you can ignore this email.</EnText>
  </AqlaAuthLayout>
)

export default InviteEmail
