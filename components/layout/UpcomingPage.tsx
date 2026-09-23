type UpcomingPageProps = {
  title: string;
  description: string;
};

export function UpcomingPage({ title, description }: UpcomingPageProps) {
  return (
    <header className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </header>
  );
}
