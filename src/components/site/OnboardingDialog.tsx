import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parseSubjects, studentProfileSchema, teacherProfileSchema, type AppRole } from "@/lib/account";
import { malaysianLocations, studentLevels } from "@/data/sample";
import type { Tables } from "@/integrations/supabase/types";

const inputCls =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

type Props = {
  role: AppRole;
  userId: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialName?: string;
  initialStudent?: Tables<"student_profiles"> | null;
  initialTeacher?: Tables<"teacher_profiles"> | null;
};

export function OnboardingDialog({ role, userId, open, onClose, onSaved, initialName, initialStudent, initialTeacher }: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [educationLevel, setEducationLevel] = useState(initialStudent?.education_level ?? "");
  const [qualification, setQualification] = useState(initialTeacher?.qualification ?? "");
  const [subjects, setSubjects] = useState((initialTeacher?.subjects ?? []).join(", "));
  const [teachingMode, setTeachingMode] = useState(initialTeacher?.teaching_mode ?? "");
  const [location, setLocation] = useState(initialTeacher?.location ?? "");
  const [fee, setFee] = useState(initialTeacher?.fee_per_hour != null ? String(initialTeacher.fee_per_hour) : "");
  const [bio, setBio] = useState(initialTeacher?.bio ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (role === "student") {
        const parsed = studentProfileSchema.safeParse({ name, educationLevel });
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check your details.");
        const { error: pErr } = await supabase.from("profiles").update({ display_name: parsed.data.name }).eq("id", userId);
        if (pErr) throw pErr;
        const { error: sErr } = await supabase
          .from("student_profiles")
          .update({ education_level: parsed.data.educationLevel || null, completed_at: new Date().toISOString() })
          .eq("user_id", userId);
        if (sErr) throw sErr;
      } else {
        const parsed = teacherProfileSchema.safeParse({
          qualification,
          subjects,
          teachingMode,
          location,
          feePerHour: fee === "" ? 0 : Number(fee),
          bio,
        });
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check your details.");
        const { error: tErr } = await supabase
          .from("teacher_profiles")
          .update({
            qualification: parsed.data.qualification || null,
            subjects: parseSubjects(parsed.data.subjects),
            teaching_mode: parsed.data.teachingMode || null,
            location: parsed.data.location || null,
            fee_per_hour: fee === "" ? null : parsed.data.feePerHour,
            bio: parsed.data.bio || null,
            completed_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        if (tErr) throw tErr;
      }
      toast.success("Profile saved.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{role === "student" ? "Tell us about yourself" : "Set up your tutor listing"}</DialogTitle>
          <DialogDescription>
            {role === "student"
              ? "A couple of quick details help us personalise your experience. You can skip this and finish it later."
              : "This information becomes your tutor listing. New listings stay hidden until an admin approves them. You can skip and finish later."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          {role === "student" ? (
            <>
              <Field label="Display name">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aina Rahman" />
              </Field>
              <Field label="Education level">
                <select className={inputCls} value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                  <option value="">Choose a level</option>
                  {studentLevels.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </Field>
            </>
          ) : (
            <>
              <Field label="Qualification">
                <input className={inputCls} value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="e.g. B.Ed. (Mathematics), UPSI" />
              </Field>
              <Field label="Subjects (comma separated)">
                <input className={inputCls} value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Mathematics, Add Maths" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Teaching mode">
                  <select className={inputCls} value={teachingMode} onChange={(e) => setTeachingMode(e.target.value)}>
                    <option value="">Choose a mode</option>
                    <option>Online</option>
                    <option>In-person</option>
                    <option>Online & In-person</option>
                  </select>
                </Field>
                <Field label="Location">
                  <select className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option value="">Choose a location</option>
                    {malaysianLocations.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Hourly fee (RM)">
                <input className={inputCls} type="number" min={0} step={5} value={fee} onChange={(e) => setFee(e.target.value)} placeholder="e.g. 60" />
              </Field>
              <Field label="Short bio">
                <textarea className={`${inputCls} min-h-24 resize-y`} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell students about your experience and teaching style." />
              </Field>
            </>
          )}
          {error && <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive" role="alert">{error}</p>}
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Skip for later
            </Button>
            <Button type="submit" variant="pill" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              Save my profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
