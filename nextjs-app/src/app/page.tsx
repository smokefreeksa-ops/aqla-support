export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold tracking-wide text-emerald-700">AQla</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Production migration foundation
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          This isolated Next.js application is the new production foundation for AQla.
          The existing live Lovable application remains unchanged while features are
          migrated and verified in parallel.
        </p>
      </div>
    </main>
  );
}
