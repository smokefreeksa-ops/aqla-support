import { cookies } from 'next/headers'
import { authCookies, verifyCognitoIdToken } from '@/lib/cognito'

export const dynamic = 'force-dynamic'

export default async function AqlaPage() {
  const cookieStore = await cookies()
  const idToken = cookieStore.get(authCookies.idToken)?.value

  let signedIn = false
  let email: string | undefined

  if (idToken) {
    try {
      const user = await verifyCognitoIdToken(idToken)
      signedIn = true
      email = typeof user.email === 'string' ? user.email : undefined
    } catch {
      signedIn = false
    }
  }

  return (
    <main className="aqla-study-page" dir="rtl" lang="ar">
      <div className="aqla-study-glow" aria-hidden="true" />
      <div className="aqla-study-grid" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <a href="/" className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-[#bcd8c9] transition hover:bg-white/[0.07] hover:text-white">
            العودة للدراسة
          </a>
          <div className="aqla-wordmark" aria-label="AQla">
            <span className="aqla-wordmark-ar">أقلع</span>
            <span className="aqla-wordmark-en">AQla</span>
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-4xl text-center">
            <div className="mx-auto inline-flex rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/[0.07] px-4 py-2 text-xs font-bold tracking-wide text-[#e6c97a]">
              نظام أقلع الذكي
            </div>

            <h1 className="mx-auto mt-5 max-w-[18ch] text-balance text-4xl font-bold leading-[1.35] tracking-tight text-[#f4fbf7] sm:text-5xl">
              نبدأ من وضعك الحالي، وليس من افتراض أنك جاهز للإقلاع
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#bcd8c9] sm:text-lg">
              أجب عن مجموعة قصيرة من الأسئلة، وسيبني أقلع لك مسارًا شخصيًا يناسب استخدامك للنيكوتين واستعدادك الحالي، ثم يتابع معك تلقائيًا.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['أريد الإقلاع الآن', 'خطة واضحة وخطوات عملية للبدء'],
                ['أفكر في الإقلاع', 'دعم يناسب مرحلة الاستعداد الحالية'],
                ['لست مستعدًا الآن', 'مساعدة بدون ضغط أو فرض خطة إقلاع'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-right shadow-[0_18px_40px_-28px_rgba(0,0,0,0.8)]">
                  <h2 className="text-base font-bold text-[#f4fbf7]">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#9fbfae]">{text}</p>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-8 max-w-xl">
              {signedIn ? (
                <>
                  <div className="mb-3 text-xs text-[#8fb5a2]">
                    تم تسجيل الدخول{email ? ` باسم ${email}` : ''}
                  </div>
                  <a href="#assessment" className="aqla-primary-button flex min-h-[62px] w-full items-center justify-center rounded-2xl px-6 text-lg font-bold text-[#fff4d6]">
                    ابدأ التقييم الشخصي
                  </a>
                </>
              ) : (
                <a href="/auth/login" className="aqla-primary-button flex min-h-[62px] w-full items-center justify-center rounded-2xl px-6 text-lg font-bold text-[#fff4d6]">
                  سجّل الدخول وابدأ
                </a>
              )}
              <p className="mt-3 text-xs leading-6 text-[#769a88]">
                التقييم والخطة والمتابعة الآلية هي المرحلة التالية من البناء.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
