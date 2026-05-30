function PublicPage({ eyebrow, title, subtitle, children }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-3xl leading-7 text-slate-600">{subtitle}</p> : null}
      </section>
      <section className="mt-6">{children}</section>
    </main>
  );
}

export default PublicPage;
