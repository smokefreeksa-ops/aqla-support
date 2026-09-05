import * as React from 'react'

import {
  AqlaAuthLayout,
  AqlaButton,
  ArText,
  EnText,
  fallbackStyle,
} from './_aqla-auth-layout'
import { Text } from '@react-email/components'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <AqlaAuthLayout
    preview="إعادة تعيين كلمة المرور في أقلع"
    headingAr="إعادة تعيين كلمة المرور"
    headingEn="Reset your password"
  >
    <ArText>
      وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بحسابك في أقلع. اضغط على الزر
      أدناه لاختيار كلمة مرور جديدة.
    </ArText>
    <AqlaButton
      href={confirmationUrl}
      labelAr="إعادة تعيين كلمة المرور"
      labelEn="Reset password"
    />
    <EnText>Click the button above to choose a new password.</EnText>
    <Text style={fallbackStyle}>{confirmationUrl}</Text>
    <ArText>إذا لم تطلب ذلك، تجاهل هذه الرسالة وستبقى كلمة مرورك كما هي.</ArText>
    <EnText>
      If you didn't request this, ignore this email — your password stays
      unchanged.
    </EnText>
  </AqlaAuthLayout>
)

export default RecoveryEmail
