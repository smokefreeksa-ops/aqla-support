export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold tracking-wide text-emerald-700">AQla</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          AWS production migration foundation
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          AQla v2 is now hosted on AWS Amplify. Amazon Cognito authentication is being
          integrated here while the existing live Lovable application remains unchanged.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white"
            href="/auth/login"
          >
            Sign in with Amazon Cognito
          </a>
          <a
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold"
            href="/auth/logout"
          >
            Sign out
          </a>
        </div>
      </div>
    </main>
  )
}
