export default function FormBuilderPage({ params }: { params: { slug: string } }) {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b px-6 py-4 shrink-0">
        <h1 className="text-lg font-semibold">Form Builder</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">{params.slug}</p>
      </header>
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Builder coming soon.
      </div>
    </div>
  );
}
