import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function PortalHero({
  title,
  coverUrl,
  primaryColor,
}: {
  title: string;
  coverUrl: string | null;
  primaryColor: string;
}) {
  return (
    <section className="relative aspect-[21/9] w-full overflow-hidden bg-surface-container-high">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className="h-full w-full object-cover" />
      ) : null}
      <div
        className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-on-surface/30 to-transparent"
        style={{ backgroundImage: `linear-gradient(to top, ${primaryColor}aa, transparent)` }}
      />
      <div className="absolute bottom-0 left-0 flex w-full flex-col gap-4 px-6 py-10 md:flex-row md:items-end md:justify-between">
        <h1 className="font-headline text-3xl font-extrabold text-white md:text-5xl">{title}</h1>
        <Link href="#galeria">
          <Button
            type="button"
            className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
          >
            Ver galeria
          </Button>
        </Link>
      </div>
    </section>
  );
}
