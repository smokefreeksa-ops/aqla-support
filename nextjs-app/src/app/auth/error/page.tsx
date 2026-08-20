import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تعذر تسجيل الدخول — أقلع',
  robots: { index: false, follow: false },
}

const messages = {
  cancelled: {
    ar: 'لم يكتمل تسجيل الدخول. يمكنك المحاولة مرة أخرى عندما تكون جاهزًا.',
    en: 'Sign-in was not completed. You can try again whenever you are ready.',
  },
  session_expired: {
    ar: 'انتهت محاولة تسجيل الدخول أو تعذر التحقق منها بأمان. ابدأ محاولة جديدة.',
    en: 'Your sign-in attempt expired or could not be verified safely. Please start a new sign-in.',
  },
  unavailable: {
    ar: 'تعذر إكمال تسجيل الدخول الآن. لم نفقد خطتك أو إجاباتك في هذه الصفحة. حاول مرة أخرى بعد قليل.',
    en: 'We could not complete sign-in right now. Please try again shortly.',
  },
} as const

type Code = keyof typeof messages

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const query = await searchParams
  const code: Code = query.code === 'cancelled' || query.code === 'session_expired' ? query.code : 'unavailable'
  const copy = messages[code]

  return (
    <main
      dir="rtl"
      lang="ar"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '32px 16px',
        background: 'linear-gradient(180deg,#f4f8f5 0%,#edf4ef 100%)',
        color: '#16392f',
      }}
    >
      <section
        aria-labelledby="auth-error-title"
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#fff',
          border: '1px solid #dce8e1',
          borderRadius: 22,
          boxShadow: '0 20px 50px rgba(18,66,48,.10)',
          padding: 'clamp(24px,5vw,42px)',
          textAlign: 'right',
        }}
      >
        <a href="/aqla" aria-label="العودة إلى أقلع" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0f5a3a' }}>
          <img src="/aqla-logo.png" alt="" width="48" height="48" style={{ objectFit: 'contain' }} />
          <strong style={{ fontSize: 22 }}>أقلع <span dir="ltr" style={{ fontSize: 14, fontWeight: 500 }}>Aqla</span></strong>
        </a>

        <h1 id="auth-error-title" style={{ margin: '28px 0 12px', fontSize: 'clamp(26px,5vw,38px)', lineHeight: 1.45 }}>
          تعذر إكمال تسجيل الدخول
        </h1>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.9, color: '#4d665d' }}>{copy.ar}</p>

        <div dir="ltr" lang="en" style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e6eee9', textAlign: 'left' }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>We could not complete sign-in</strong>
          <p style={{ margin: 0, color: '#61766e', lineHeight: 1.65 }}>{copy.en}</p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 28 }}>
          <a href="/auth/login?returnTo=%2Faqla" style={{ background: '#0f5a3a', color: '#fff', textDecoration: 'none', borderRadius: 12, padding: '13px 20px', fontWeight: 700 }}>
            حاول تسجيل الدخول مرة أخرى
          </a>
          <a href="/aqla" style={{ background: '#f2f6f3', color: '#21483a', textDecoration: 'none', borderRadius: 12, padding: '13px 20px', fontWeight: 700 }}>
            العودة إلى أقلع
          </a>
        </div>

        <p style={{ margin: '26px 0 0', fontSize: 13, lineHeight: 1.7, color: '#75877f' }}>
          للاستفسارات غير العاجلة: <a href="mailto:smokefreeksa@gmail.com" style={{ color: '#0f5a3a' }}>smokefreeksa@gmail.com</a>
        </p>
      </section>
    </main>
  )
}
