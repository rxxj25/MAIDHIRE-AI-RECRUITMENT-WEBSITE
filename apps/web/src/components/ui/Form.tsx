import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldWrapProps {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  required?: boolean;
  className?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
  /** Visually hide the label (still accessible) for icon-led compact fields. */
  hideLabel?: boolean;
}

export function FieldWrap({ label, error, hint, icon, required, className, children, hideLabel }: FieldWrapProps) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errId : hint ? hintId : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className={cn("block text-[0.85rem] font-semibold text-ink-700", hideLabel && "sr-only")}>
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger-500">
            *
          </span>
        )}
      </label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-4 top-[17px] text-ink-700">{icon}</span>}
        {children(id, describedBy)}
      </div>
      {error ? (
        <p id={errId} role="alert" className="flex items-center gap-1.5 text-[0.8rem] font-medium text-danger-500">
          <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[0.8rem] text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; icon?: ReactNode; hideLabel?: boolean; wrapClassName?: string };
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, icon, hideLabel, wrapClassName, className, required, ...rest }, ref) {
  return (
    <FieldWrap label={label} error={error} hint={hint} icon={icon} required={required} hideLabel={hideLabel} className={wrapClassName}>
      {(id, describedBy) => (
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          required={required}
          className={cn("field h-[56px]", icon && "pl-12", error && "field-error", className)}
          {...rest}
        />
      )}
    </FieldWrap>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: string; icon?: ReactNode; hideLabel?: boolean; wrapClassName?: string; placeholder?: string };
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, hint, icon, hideLabel, wrapClassName, className, required, placeholder, children, ...rest }, ref) {
  return (
    <FieldWrap label={label} error={error} hint={hint} icon={icon} required={required} hideLabel={hideLabel} className={wrapClassName}>
      {(id, describedBy) => (
        <>
          <select
            ref={ref}
            id={id}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            required={required}
            defaultValue={rest.defaultValue ?? (rest.value === undefined ? "" : undefined)}
            className={cn("field h-[56px] appearance-none pr-11", icon && "pl-12", error && "field-error", className)}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 my-auto h-4 w-4 text-ink-400" />
        </>
      )}
    </FieldWrap>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string; icon?: ReactNode; hideLabel?: boolean; wrapClassName?: string; count?: number };
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, error, hint, icon, hideLabel, wrapClassName, className, required, count, maxLength, ...rest }, ref) {
  return (
    <FieldWrap label={label} error={error} hint={hint} icon={icon} required={required} hideLabel={hideLabel} className={wrapClassName}>
      {(id, describedBy) => (
        <>
          <textarea
            ref={ref}
            id={id}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            required={required}
            maxLength={maxLength}
            className={cn("field min-h-[140px] resize-y", icon && "pl-12", error && "field-error", className)}
            {...rest}
          />
          {maxLength !== undefined && (
            <span className="pointer-events-none absolute bottom-3 right-4 text-[0.75rem] text-ink-400" aria-hidden="true">
              {count ?? 0}/{maxLength}
            </span>
          )}
        </>
      )}
    </FieldWrap>
  );
});

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; error?: string }>(function Checkbox({ label, error, className, ...rest }, ref) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[0.9rem] text-ink-700">
        <input ref={ref} id={id} type="checkbox" aria-invalid={!!error || undefined} className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded border-forest-900/30 accent-forest-900" {...rest} />
        <span>{label}</span>
      </label>
      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-danger-500">
          <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
});

export function FormSuccess({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center gap-4 rounded-2xl bg-mint-100 px-6 py-12 text-center ring-1 ring-mint-300">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-300">
        <CheckCircle2 aria-hidden="true" className="h-8 w-8 text-forest-900" />
      </span>
      <h3 className="h-serif text-2xl text-forest-950">{title}</h3>
      {children && <div className="max-w-md text-ink-500">{children}</div>}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-2 rounded-xl bg-danger-100 px-4 py-3 text-[0.9rem] font-medium text-danger-500">
      <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}
