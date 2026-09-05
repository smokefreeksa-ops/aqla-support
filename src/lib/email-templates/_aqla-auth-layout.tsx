import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export const AQLA_GREEN = '#006C35'
export const AQLA_GREEN_LIGHT = '#00A65A'
export const AQLA_LOGO_URL = 'https://aqla1.com/aqla-logo.png'
export const AQLA_SITE_URL = 'https://aqla1.com'

/**
 * Shared Arabic-first (RTL) branded shell for all Aqla authentication emails.
 * Arabic content comes first, English follows as a secondary block.
 */
export const AqlaAuthLayout = ({
  preview,
  headingAr,
  headingEn,
  children,
}: {
  preview: string
  headingAr: string
  headingEn: string
  children: React.ReactNode
}) => (
  <Html lang="ar" dir="rtl">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={AQLA_LOGO_URL} alt="أقلع | Aqla" width="72" height="72" style={logo} />
          <Text style={brand}>أقلع | Aqla</Text>
        </Section>
        <Section style={card}>
          <Heading style={h1}>{headingAr}</Heading>
          <Text style={h2}>{headingEn}</Text>
          {children}
        </Section>
        <Text style={footer}>
          أُرسلت هذه الرسالة من منصة أقلع — {AQLA_SITE_URL}
        </Text>
        <Text style={footer}>Sent by Aqla — {AQLA_SITE_URL}</Text>
      </Container>
    </Body>
  </Html>
)

export const AqlaButton = ({ href, labelAr, labelEn }: { href: string; labelAr: string; labelEn: string }) => (
  <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto 24px' }}>
    <tbody>
      <tr>
        <td align="center" style={buttonCell}>
          <a className="dm-btn" href={href} style={buttonLink}>
            {labelAr} · {labelEn}
          </a>
        </td>
      </tr>
    </tbody>
  </table>
)

export const ArText = ({ children }: { children: React.ReactNode }) => (
  <Text style={textAr}>{children}</Text>
)

export const EnText = ({ children }: { children: React.ReactNode }) => (
  <Text style={textEn}>{children}</Text>
)

export const CodeBlock = ({ token }: { token: string }) => (
  <Text style={code}>{token}</Text>
)

export const fallbackStyle = {
  fontSize: '12px',
  color: '#8a8f98',
  wordBreak: 'break-all' as const,
  margin: '0 0 8px',
  direction: 'ltr' as const,
  textAlign: 'left' as const,
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif",
  margin: 0,
  padding: '24px 0',
}
const container = { padding: '0 20px', maxWidth: '560px', margin: '0 auto' }
const header = { textAlign: 'center' as const, padding: '8px 0 16px' }
const logo = { margin: '0 auto', display: 'block' as const }
const brand = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: AQLA_GREEN,
  margin: '8px 0 0',
  textAlign: 'center' as const,
}
const card = {
  border: `1px solid ${AQLA_GREEN}33`,
  borderRadius: '16px',
  padding: '28px 24px',
  backgroundColor: '#ffffff',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: AQLA_GREEN,
  margin: '0 0 6px',
  textAlign: 'center' as const,
}
const h2 = {
  fontSize: '14px',
  fontWeight: 'bold' as const,
  color: '#55575d',
  margin: '0 0 22px',
  textAlign: 'center' as const,
  direction: 'ltr' as const,
}
const textAr = {
  fontSize: '15px',
  color: '#333333',
  lineHeight: '1.8',
  margin: '0 0 14px',
  textAlign: 'right' as const,
}
const textEn = {
  fontSize: '13px',
  color: '#55575d',
  lineHeight: '1.6',
  margin: '0 0 20px',
  direction: 'ltr' as const,
  textAlign: 'left' as const,
}
const buttonCell = {
  backgroundColor: AQLA_GREEN,
  borderRadius: '10px',
}
const buttonLink = {
  display: 'inline-block',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  padding: '14px 28px',
  textDecoration: 'none',
}
const code = {
  fontSize: '30px',
  fontWeight: 'bold' as const,
  letterSpacing: '8px',
  color: AQLA_GREEN,
  textAlign: 'center' as const,
  margin: '8px 0 20px',
  direction: 'ltr' as const,
}
const footer = {
  fontSize: '11px',
  color: '#9aa0a6',
  textAlign: 'center' as const,
  margin: '18px 0 0',
}
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { color: #ffffff !important; }
  }
`
