import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { Clock, GraduationCap, MapPin, RotateCcw, Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { tutors, malaysianLocations, studentLevels, type Tutor } from "@/data/sample";
import { defaultFilters, filterTutors, type TutorFilters } from "@/lib/tutor-filters";

const URL = "https://screenshot-to-screen-60.lovable.app/tutors";

export const Route = createFileRoute("/tutors")({
  head: () => ({
    meta: [
      { title: "Find Tutors — PUPUK Education" },
      { name: "description", content: "Browse tutors across Malaysia by subject, location, level, teaching mode and hourly fee." },
      { property: "og:title", content: "Find Tutors — PUPUK Education" },
      { property: "og:description", content: "Search and filter tutors by subject, location, level and price." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: TutorsPage,
});

const subjects = Array.from(new Set(tutors.flatMap((t) => t.subjects))).sort();
const selectCls = "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>{children}</label>;
}

function TutorsPage() {
  const [f, setF] = useState<TutorFilters>(defaultFilters);
  const [contact, setContact] = useState<Tutor | null>(null);
  const set = <K extends keyof TutorFilters>(k: K, v: TutorFilters[K]) => setF((p) => ({ ...p, [k]: v }));
  const results = useMemo(() => filterTutors(tutors, f), [f]);
  const dirty = JSON.stringify(f) !== JSON.stringify(defaultFilters);
  const reset = () => setF(defaultFilters);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="bg-hero">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Find Tutors</p>
            <h1 className="text-4xl font-extrabold md:text-5xl">Find a tutor who fits how you learn</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Search by subject, then narrow down by location, teaching mode, student level and hourly fee.</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex max-w-2xl items-center gap-2 rounded-full bg-card p-2 pl-5 shadow-lift">
              <Search className="size-5 shrink-0 text-muted-foreground" />
              <input value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Search a subject or tutor name, e.g. Physics" aria-label="Search tutors"
                className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-muted-foreground" />
              <Button type="submit" variant="pill" size="xl">Search</Button>
            </form>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
          <aside className="card-soft h-fit space-y-4 p-6 lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Filters</h2>
              <button onClick={reset} disabled={!dirty} className="inline-flex items-center gap-1 text-sm font-bold text-primary disabled:opacity-40"><RotateCcw className="size-4" /> Reset</button>
            </div>
            <Field label="Subject">
              <select className={selectCls} value={f.subject} onChange={(e) => set("subject", e.target.value)}>
                <option value="">All subjects</option>{subjects.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <select className={selectCls} value={f.location} onChange={(e) => set("location", e.target.value)}>
                <option value="">Anywhere in Malaysia</option>{malaysianLocations.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Availability">
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1" role="radiogroup">
                {([["any", "Any"], ["online", "Online"], ["in-person", "In-person"]] as const).map(([v, l]) => (
                  <button key={v} type="button" role="radio" aria-checked={f.mode === v} onClick={() => set("mode", v)}
                    className={`rounded-lg px-2 py-2 text-xs font-bold ${f.mode === v ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>{l}</button>
                ))}
              </div>
            </Field>
            <Field label="Student level">
              <select className={selectCls} value={f.level} onChange={(e) => set("level", e.target.value)}>
                <option value="">All levels</option>{studentLevels.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label={`Hourly fee (RM${f.minFee} – RM${f.maxFee})`}>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min={0} step={5} aria-label="Minimum fee" className={selectCls} value={f.minFee} onChange={(e) => set("minFee", Number(e.target.value) || 0)} />
                <input type="number" min={0} step={5} aria-label="Maximum fee" className={selectCls} value={f.maxFee} onChange={(e) => set("maxFee", Number(e.target.value) || 0)} />
              </div>
            </Field>
          </aside>

          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="font-bold" aria-live="polite">{results.length} {results.length === 1 ? "tutor" : "tutors"} found</p>
              <label className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-muted-foreground">Sort by
                <select className={`${selectCls} w-auto`} value={f.sort} onChange={(e) => set("sort", e.target.value as TutorFilters["sort"])}>
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="experience">Most experience</option>
                </select>
              </label>
            </div>
            <p className="mb-5 rounded-2xl bg-butter px-4 py-3 text-sm font-semibold">These are sample demo profiles to show how the directory works — not real tutors.</p>

            {results.length === 0 ? (
              <div className="card-soft p-10 text-center">
                <SearchX className="mx-auto size-10 text-primary" />
                <h3 className="mt-4 text-xl font-extrabold">No tutors match those filters</h3>
                <p className="mt-2 text-muted-foreground">Try a different subject, widen the fee range or switch availability to “Any”.</p>
                <Button variant="pill" className="mt-6" onClick={reset}><RotateCcw /> Reset filters</Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((t) => (
                  <article key={t.id} className="card-soft relative flex flex-col overflow-hidden">
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-card px-3 py-1 text-xs font-bold text-muted-foreground shadow-soft">Demo profile</span>
                    {t.photo ? <img src={t.photo} alt={t.name} loading="lazy" width={816} height={816} className="aspect-[4/3] w-full object-cover" />
                      : <div className="grid aspect-[4/3] place-items-center bg-mint font-display text-5xl font-extrabold text-primary" aria-hidden>{t.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}</div>}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-xl font-extrabold">{t.name}</h3>
                      <p className="text-sm text-muted-foreground">{t.qualification}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {t.subjects.map((s) => <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">{s}</span>)}
                      </div>
                      <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2"><Clock className="size-4" /> {t.experience} experience</p>
                        <p className="flex items-center gap-2"><MapPin className="size-4" /> {t.location} · {t.mode}</p>
                        <p className="flex items-center gap-2"><GraduationCap className="size-4" /> {t.levels.join(", ")}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                        <p><span className="font-display text-2xl font-extrabold">RM{t.fee}</span><span className="text-sm text-muted-foreground">/hour</span></p>
                        <Button variant="pill" onClick={() => setContact(t)}>Contact</Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />

      <Dialog open={!!contact} onOpenChange={(o) => !o && setContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contacting tutors is coming soon</DialogTitle>
            <DialogDescription>
              {contact?.name} is a sample demo profile. Full tutor profiles and messaging aren't available yet, so no message will be sent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter><Button variant="pill" onClick={() => setContact(null)}>Got it</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
