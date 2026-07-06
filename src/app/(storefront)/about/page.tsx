export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-12 sm:py-16 text-center">
      <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">About</div>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold">
        Designed for Everyday Statements.
      </h1>
      <p className="text-sm text-neutral-600 mt-4 leading-relaxed max-w-xl mx-auto">
        Capartefegas is a Lagos-built streetwear label for people who treat getting dressed
        as a daily act of self-expression. Every piece is designed in-house, produced in
        limited runs, and meant to outlast the season it dropped in.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://picsum.photos/seed/cpt-about/1000/600"
        alt=""
        className="w-full mt-8 object-cover"
      />
    </div>
  );
}
