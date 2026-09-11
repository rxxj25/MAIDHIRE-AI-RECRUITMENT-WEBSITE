import { Briefcase, CalendarDays, Globe2, MapPin, Search, UserRound } from "lucide-react";
import { ALL_CITIES, AVAILABILITY, AVAILABILITY_LABELS, EXPERIENCE_BANDS, NATIONALITIES, SERVICE_TYPES } from "@maidhire/shared";
import { Select } from "@/components/ui/Form";

export interface Filters {
  service?: string;
  city?: string;
  nationality?: string;
  experience?: string;
  availability?: string;
}

/** The four-dropdown filter bar from the mockup, plus nationality (essential in the Gulf market). */
export function CandidateFilters({ value, onChange, onSubmit }: { value: Filters; onChange: (f: Filters) => void; onSubmit?: () => void }) {
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...value, [k]: e.target.value || undefined });
  const selectCls = "h-[60px] rounded-xl border-forest-900/15 bg-white text-[0.98rem] font-medium shadow-soft";
  return (
    <form
      role="search"
      aria-label="Filter candidates"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]"
    >
      <Select label="Role" hideLabel icon={<UserRound className="h-5 w-5" />} value={value.service ?? ""} onChange={set("service")} className={selectCls}>
        <option value="">Select Role</option>
        {SERVICE_TYPES.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.label}
          </option>
        ))}
      </Select>
      <Select label="Location" hideLabel icon={<MapPin className="h-5 w-5" />} value={value.city ?? ""} onChange={set("city")} className={selectCls}>
        <option value="">Location</option>
        {ALL_CITIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Select label="Nationality" hideLabel icon={<Globe2 className="h-5 w-5" />} value={value.nationality ?? ""} onChange={set("nationality")} className={selectCls}>
        <option value="">Nationality</option>
        {NATIONALITIES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </Select>
      <Select label="Experience" hideLabel icon={<Briefcase className="h-5 w-5" />} value={value.experience ?? ""} onChange={set("experience")} className={selectCls}>
        <option value="">Experience</option>
        {EXPERIENCE_BANDS.map((b) => (
          <option key={b.value} value={b.value}>
            {b.label}
          </option>
        ))}
      </Select>
      <Select label="Availability" hideLabel icon={<CalendarDays className="h-5 w-5" />} value={value.availability ?? ""} onChange={set("availability")} className={selectCls}>
        <option value="">Availability</option>
        {AVAILABILITY.map((a) => (
          <option key={a} value={a}>
            {AVAILABILITY_LABELS[a]}
          </option>
        ))}
      </Select>
      <button type="submit" aria-label="Search" className="flex h-[60px] items-center justify-center gap-2 rounded-xl bg-forest-900 px-6 font-semibold text-white transition hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mint-300/60 md:col-span-2 lg:col-span-1">
        <Search className="h-5 w-5" aria-hidden="true" />
        <span className="lg:sr-only">Search</span>
      </button>
    </form>
  );
}
