export default function EmptyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex flex-col items-center justify-center">
      <section className="lg:max-w-7/12 max-w-12/12">{children}</section>
    </main>
  );
}
