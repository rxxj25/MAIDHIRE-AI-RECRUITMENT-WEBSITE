import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Plus, Trash2, Upload } from "lucide-react";
import { ACCEPTED_DOCUMENT_TYPES, ACCEPTED_IMAGE_TYPES, AVAILABILITY, AVAILABILITY_LABELS, CITIES, COUNTRIES, LANGUAGES, MAX_DOCUMENT_BYTES, MAX_IMAGE_BYTES, NATIONALITIES, SERVICE_TYPES, SKILLS, candidateApplicationSchema, type CandidateApplicationInput } from "@maidhire/shared";
import { Checkbox, FormError, FormSuccess, Input, Select, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useSubmit } from "./useSubmit";
import { cn } from "@/lib/utils";

function Chips({ label, options, value, onChange, max, error }: { label: string; options: readonly string[]; value: string[]; onChange: (v: string[]) => void; max: number; error?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[0.85rem] font-semibold text-ink-700">
        {label} <span className="text-danger-500">*</span> <span className="font-normal text-ink-400">(up to {max})</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button key={o} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((v) => v !== o) : value.length < max ? [...value, o] : value)} className={cn("h-9 rounded-full border px-4 text-[0.85rem] font-medium transition-colors", on ? "border-forest-900 bg-forest-900 text-white" : "border-forest-900/15 bg-white text-ink-700 hover:border-forest-900/40")}>
              {o}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[0.8rem] font-medium text-danger-500">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function FileInput({ label, hint, accept, multiple, onChange, error }: { label: string; hint: string; accept: string; multiple?: boolean; onChange: (files: File[]) => void; error?: string }) {
  const [names, setNames] = useState<string[]>([]);
  return (
    <div>
      <label className="block text-[0.85rem] font-semibold text-ink-700">{label}</label>
      <label className={cn("mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-4 text-[0.9rem] transition-colors hover:border-forest-900/50", error ? "border-danger-500" : "border-forest-900/25")}>
        <Upload aria-hidden="true" className="h-5 w-5 shrink-0 text-forest-800" />
        <span className="flex-1 text-ink-700">{names.length ? names.join(", ") : hint}</span>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setNames(files.map((f) => f.name));
            onChange(files);
          }}
        />
      </label>
      {error && (
        <p role="alert" className="mt-1.5 text-[0.8rem] font-medium text-danger-500">
          {error}
        </p>
      )}
    </div>
  );
}

export function CandidateApplicationForm() {
  const { register, handleSubmit, control, watch, setValue, setError, formState: { errors } } = useForm<CandidateApplicationInput>({
    resolver: zodResolver(candidateApplicationSchema),
    defaultValues: { currentCountry: "AE", currentCity: "Dubai", salaryCurrency: "AED", skills: [], languages: [], references: [], hasGulfExperience: false, liveInPreferred: true, availability: "IMMEDIATE" },
  });
  const refs = useFieldArray({ control, name: "references" });
  const { submitting, success, error, run } = useSubmit(setError);
  const [photo, setPhoto] = useState<File | null>(null);
  const [docs, setDocs] = useState<File[]>([]);
  const [fileErr, setFileErr] = useState<{ photo?: string; documents?: string }>({});
  const country = watch("currentCountry");
  const summary = watch("experienceSummary") ?? "";

  const validateFiles = () => {
    const e: typeof fileErr = {};
    if (photo && (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(photo.type) || photo.size > MAX_IMAGE_BYTES)) e.photo = "Photo must be JPG, PNG or WebP under 5 MB";
    if (docs.length > 4) e.documents = "Maximum 4 documents";
    for (const d of docs) if (!(ACCEPTED_DOCUMENT_TYPES as readonly string[]).includes(d.type) || d.size > MAX_DOCUMENT_BYTES) e.documents = "Documents must be JPG, PNG, WebP or PDF under 10 MB";
    setFileErr(e);
    return Object.keys(e).length === 0;
  };

  if (success) {
    return (
      <FormSuccess title="Application received">
        <p>Thank you for applying. Our recruitment team will review your profile and contact you on WhatsApp or phone within 3 working days.</p>
      </FormSuccess>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((data) => {
        if (!validateFiles()) return;
        const fd = new FormData();
        fd.append("payload", JSON.stringify(data));
        if (photo) fd.append("photo", photo);
        for (const d of docs) fd.append("documents", d);
        return run(() => api("/api/candidates/apply", { method: "POST", body: fd }));
      })}
      className="space-y-8"
    >
      <section className="space-y-4">
        <h2 className="h-serif text-2xl text-ink-950">Personal details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" required autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
          <Input label="Last name" required autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
          <Input label="Mobile number" required type="tel" inputMode="tel" placeholder="+971 5X XXX XXXX" error={errors.phone?.message} {...register("phone")} />
          <Input label="WhatsApp number" type="tel" inputMode="tel" hint="If different from mobile" error={errors.whatsapp?.message} {...register("whatsapp")} />
          <Input label="Email" type="email" inputMode="email" error={errors.email?.message} {...register("email")} />
          <Input label="Date of birth" required type="date" error={errors.dateOfBirth?.message} {...register("dateOfBirth")} />
          <Select label="Nationality" required placeholder="Select nationality" error={errors.nationality?.message} {...register("nationality")}>
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
          <Select label="Current country" required error={errors.currentCountry?.message} {...register("currentCountry", { onChange: (e) => setValue("currentCity", CITIES[e.target.value as "AE" | "SA"][0]) })}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select label="Current city" required error={errors.currentCity?.message} {...register("currentCity")}>
            {CITIES[country].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="h-serif text-2xl text-ink-950">Experience & skills</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Primary role" required placeholder="Select role" error={errors.primaryService?.message} {...register("primaryService")}>
            {SERVICE_TYPES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </Select>
          <Input label="Years of experience" required type="number" min={0} max={40} inputMode="numeric" error={errors.yearsExperience?.message} {...register("yearsExperience")} />
        </div>
        <Controller control={control} name="skills" render={({ field }) => <Chips label="Skills" options={SKILLS} value={field.value} onChange={field.onChange} max={8} error={errors.skills?.message} />} />
        <Controller control={control} name="languages" render={({ field }) => <Chips label="Languages" options={LANGUAGES} value={field.value} onChange={field.onChange} max={6} error={errors.languages?.message} />} />
        <Textarea label="Describe your experience" required maxLength={1500} count={summary.length} placeholder="Where have you worked, for how long, and what were your duties?" error={errors.experienceSummary?.message} {...register("experienceSummary")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Checkbox label="I have worked in the Gulf (UAE / KSA) before" {...register("hasGulfExperience")} />
          <Checkbox label="I prefer a live-in position" {...register("liveInPreferred")} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="h-serif text-2xl text-ink-950">Availability & salary</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Availability" required error={errors.availability?.message} {...register("availability")}>
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {AVAILABILITY_LABELS[a]}
              </option>
            ))}
          </Select>
          <Input label="Expected monthly salary" required type="number" min={500} max={20000} inputMode="numeric" error={errors.expectedSalary?.message} {...register("expectedSalary")} />
          <Select label="Currency" required {...register("salaryCurrency")}>
            <option value="AED">AED</option>
            <option value="SAR">SAR</option>
          </Select>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="h-serif text-2xl text-ink-950">Photo & documents</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileInput label="Profile photo" hint="JPG, PNG or WebP · max 5 MB" accept="image/jpeg,image/png,image/webp" onChange={(f) => setPhoto(f[0] ?? null)} error={fileErr.photo} />
          <FileInput label="Supporting documents" hint="Passport, certificates, references · up to 4 files" accept="image/jpeg,image/png,image/webp,application/pdf" multiple onChange={setDocs} error={fileErr.documents} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="h-serif text-2xl text-ink-950">References <span className="text-base font-normal text-ink-400">(optional)</span></h2>
          {refs.fields.length < 3 && (
            <button type="button" onClick={() => refs.append({ name: "", relation: "", phone: "" })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-900">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add reference
            </button>
          )}
        </div>
        {refs.fields.map((f, i) => (
          <div key={f.id} className="grid gap-3 rounded-xl bg-cream-100 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Input label="Name" error={errors.references?.[i]?.name?.message} {...register(`references.${i}.name`)} />
            <Input label="Relation" placeholder="e.g. Former employer" error={errors.references?.[i]?.relation?.message} {...register(`references.${i}.relation`)} />
            <Input label="Phone" type="tel" error={errors.references?.[i]?.phone?.message} {...register(`references.${i}.phone`)} />
            <button type="button" onClick={() => refs.remove(i)} aria-label="Remove reference" className="mt-7 flex h-12 w-12 items-center justify-center rounded-xl text-ink-400 hover:bg-danger-100 hover:text-danger-500">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </section>

      <Checkbox
        label={
          <>
            I confirm the information is accurate and agree to the{" "}
            <Link to="/terms" className="underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </>
        }
        error={errors.consent?.message}
        {...register("consent")}
      />
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />
      <FormError message={error} />
      <Button type="submit" size="lg" arrow loading={submitting} className="w-full rounded-lg text-[1.05rem] sm:w-auto sm:px-12">
        Submit Application
      </Button>
    </form>
  );
}
