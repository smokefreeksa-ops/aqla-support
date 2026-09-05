import * as React from 'react'

import { AqlaAuthLayout, ArText, CodeBlock, EnText } from './_aqla-auth-layout'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <AqlaAuthLayout
    preview="رمز التحقق الخاص بك في أقلع"
    headingAr="رمز التحقق الخاص بك"
    headingEn="Your verification code"
  >
    <ArText>استخدم الرمز التالي لإتمام عملية التحقق في منصة أقلع:</ArText>
    <CodeBlock token={token} />
    <EnText>Use this code to complete verification in Aqla. It expires shortly.</EnText>
    <ArText>إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.</ArText>
    <EnText>If you didn't request this code, you can ignore this email.</EnText>
  </AqlaAuthLayout>
)

export default ReauthenticationEmail
