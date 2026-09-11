import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { CITIES, COUNTRIES, LANGUAGES, NATIONALITIES, SERVICE_TYPES, hireRequestSchema, type HireRequestInput, type PublicPlan } from "@maidhire/shared";
import { Checkbox, FormError, FormSuccess, Input, Select, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { post } from "@/lib/api";
import { useSubmit } from "./useSubmit";
import { cn } from "@/lib/utils";

interface Props {
  plans?: PublicPlan[];
  defaultPlan?: string;
  candidate?: { id: string; displayName: string; primaryService: string };
  defaultService?: string;
}

function ChipGroup({ label, options, value, onChange, max = 5 }: { label: string; options: readonly string[]; value: string[]; onChange: (v: string[]) => void; max?: number }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[0.85rem] font-semibold text-ink-700">
        {label} <span className="font-normal text-ink-400">(optional, up to {max})</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o) : value.length < max ? [...value, o] : value)}
              className={cn("h-9 rounded-full border px-4 text-[0.85rem] font-medium transition-colors", on ? "border-forest-900 bg-forest-900 text-white" : "border-forest-900/15 bg-white text-ink-700 hover:border-forest-900/40")}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Employer hire request — no account needed; stored as a HireRequest row and emailed to ops. */
export function HireRequestForm({ plans, defaultPlan, candidate, defaultService }: Props) {
  const { register, handleSubmit, control, watch, setValue, setError, formState: { errors } } = useForm<HireRequestInput>({
    resolver: zodResolver(hireRequestSchema),
    defaultValues: {
      country: "AE",
      city: "Dubai",
      liveIn: true,
      preferredNationalities: [],
      preferredLanguages: [],
      planSlug: defaultPlan && defaultPlan !== "custom" ? defaultPlan : undefined,
      candidateId: candidate?.id,
      service: (candidate?.primaryService ?? defaultService) as HireRequestInput["service"],
      notes: defaultPlan === "custom" ? "I'd like a custom plan. " : "",
    },
  });
  const { submitting, success, error, run } = useSubmit(setError);
  const country = watch("country");

  if (success) {
    return (
      <FormSuccess title="Request received">
        <p>Thank you. We've emailed you a confirmation and a consultant will call you within 24 hours to begin matching.</p>
        <Link to="/candidates" className="mt-4 inline-block text-sm font-semibold text-forest-900 underline-offset-4 hover:underline">
          Keep browsing candidates
        </Link>
      </FormSuccess>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit((data) => run(() => post("/api/hire-requests", data)))} className="space-y-5">
      {candidate && (
        <p className="rounded-xl bg-mint-100 px-4 py-3 text-[0.9rem] text-forest-950 ring-1 ring-mint-300">
          Requesting <strong>{candidate.displayName}</strong>. We'll confirm availability and arrange an interview.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" required autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
        <Input label="Email" required type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register("email")} />
        <Input label="Mobile number" required type="tel" autoComplete="tel" inputMode="tel" placeholder={country === "SA" ? "+966 5X XXX XXXX" : "+971 5X XXX XXXX"} error={errors.phone?.message} {...register("phone")} />
        <Select label="Country" required error={errors.country?.message} {...register("country", { onChange: (e) => setValue("city", CITIES[e.target.value as "AE" | "SA"][0]) })}>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select label="City" required error={errors.city?.message} {...register("city")}>
          {CITIES[country].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select label="Service needed" required placeholder="Select a service" error={errors.service?.message} {...register("service")}>
          {SERVICE_TYPES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </Select>
        {plans && plans.length > 0 && (
          <Select label="Plan" error={errors.planSlug?.message} {...register("planSlug", { setValueAs: (v) => (v === "" ? undefined : v) })}>
            <option value="">Not sure yet — advise me</option>
            {plans.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} — {p.tagline}
              </option>
            ))}
          </Select>
        )}
        <Input label="Preferred start date" type="date" error={errors.startDate?.message} {...register("startDate")} />
        <Input label="Household size" type="number" min={1} max={30} inputMode="numeric" placeholder="e.g. 4" error={errors.familySize?.message} {...register("familySize", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} />
        <Select label="Arrangement" {...register("liveIn", { setValueAs: (v) => v === "true" || v === true })}>
          <option value="true">Live-in</option>
          <option value="false">Live-out</option>
        </Select>
      </div>
      <Controller control={control} name="preferredNationalities" render={({ field }) => <ChipGroup label="Preferred nationalities" options={NATIONALITIES.filter((n) => n !== "Other")} value={field.value} onChange={field.onChange} />} />
      <Controller control={control} name="preferredLanguages" render={({ field }) => <ChipGroup label="Preferred languages" options={LANGUAGES} value={field.value} onChange={field.onChange} />} />
      <Textarea label="Anything else we should know?" placeholder="Working hours, duties, pets, special care needs…" maxLength={1000} className="min-h-[110px]" error={errors.notes?.message} {...register("notes")} />
      <Checkbox
        label={
          <>
            I agree to the{" "}
            <Link to="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>{" "}
            and consent to being contacted about my request.
          </>
        }
        error={errors.consent?.message}
        {...register("consent")}
      />
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />
      <FormError message={error} />
      <Button type="submit" size="lg" arrow loading={submitting} className="w-full rounded-lg text-[1.05rem] sm:w-auto sm:px-12">
        Submit Request
      </Button>
    </form>
  );
}
