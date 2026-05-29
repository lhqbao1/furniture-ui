export default function EmptyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen w-full">
      <section className="w-full">{children}</section>
    </main>
  );
}
