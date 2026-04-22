export function PortalGallery({ coverUrl }: { coverUrl: string | null }) {
  return (
    <section id="galeria" className="rounded-2xl border border-outline-variant/15 p-6 shadow-sm">
      <h2 className="font-headline text-lg font-bold">Galeria</h2>
      <div className="mt-4 grid grid-cols-2 grid-rows-2 gap-3 md:grid-cols-4">
        <div className="col-span-2 row-span-2 overflow-hidden rounded-xl bg-surface-container-high">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-full min-h-[200px] w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-on-surface-variant">
              Sem imagens
            </div>
          )}
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="min-h-[96px] rounded-xl bg-surface-container-high/80"
            aria-hidden
          />
        ))}
      </div>
    </section>
  );
}
