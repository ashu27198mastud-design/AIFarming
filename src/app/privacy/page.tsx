import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="auth-canvas flex min-h-screen items-center justify-center px-4 py-8 text-[#202124]">
      <section className="auth-card w-full max-w-2xl rounded-[28px] border border-white/90 bg-white/86 p-6 shadow-[0_24px_80px_rgba(60,64,67,0.16)] backdrop-blur-2xl sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.08em] text-[#137333]">KisanMitra Predict</p>
        <h1 className="mt-3 text-3xl font-black text-[#123524]">Privacy</h1>
        <p className="mt-4 text-base font-bold leading-7 text-[#4F5B54]">
          Your farm details, crop photos, location, and language choice are used only to give farming advice inside this app.
          Demo and local test accounts stay on this device unless a connected service is added.
        </p>
        <p className="mt-4 text-base font-bold leading-7 text-[#4F5B54]">
          We do not show technical error messages to farmers. When live services such as Google login, weather, or market APIs are connected,
          the app should use the minimum data needed for the selected advice.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#1E8E3E] px-5 text-base font-black text-white shadow-[0_12px_26px_rgba(30,142,62,0.24)]"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}
