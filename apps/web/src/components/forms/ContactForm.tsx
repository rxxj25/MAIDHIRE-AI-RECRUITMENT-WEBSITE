import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageSquare, Phone, Sparkles, User } from "lucide-react";
import { contactMessageSchema, SERVICE_TYPES, type ContactMessageInput } from "@maidhire/shared";
import { Input, Select, Textarea, FormSuccess, FormError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { post } from "@/lib/api";
import { useSubmit } from "./useSubmit";
import { Link } from "react-router-dom";

export function ContactForm({ defaultService }: { defaultService?: string }) {
  const { register, handleSubmit, setError, watch, reset, formState: { errors } } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { service: (defaultService as ContactMessageInput["service"]) ?? undefined, message: "" },
  });
  const { submitting, success, error, run } = useSubmit(setError);
  const message = watch("message") ?? "";

  if (success) {
    return (
      <FormSuccess title="Message sent">
        <p>Thank you — a MaidHire consultant will reply within 24 hours.</p>
        <button type="button" onClick={() => reset()} className="mt-4 text-sm font-semibold text-forest-900 underline-offset-4 hover:underline">
          Send another message
        </button>
      </FormSuccess>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit((data) => run(() => post("/api/contact", data)))} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Your Name" hideLabel placeholder="Your Name" autoComplete="name" icon={<User className="h-5 w-5" />} error={errors.name?.message} {...register("name")} />
        <Input label="Your Email" hideLabel type="email" placeholder="Your Email" autoComplete="email" inputMode="email" icon={<Mail className="h-5 w-5" />} error={errors.email?.message} {...register("email")} />
      </div>
      <Input label="Phone Number" hideLabel type="tel" placeholder="Phone Number (+971 / +966)" autoComplete="tel" inputMode="tel" icon={<Phone className="h-5 w-5" />} error={errors.phone?.message} {...register("phone")} />
      <Select label="Select Service" hideLabel icon={<Sparkles className="h-5 w-5" />} error={errors.service?.message} {...register("service", { setValueAs: (v) => (v === "" ? undefined : v) })}>
        <option value="">Select Service</option>
        {SERVICE_TYPES.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.label}
          </option>
        ))}
      </Select>
      <Textarea label="Your Message" hideLabel placeholder="Your Message" maxLength={500} count={message.length} icon={<MessageSquare className="h-5 w-5" />} error={errors.message?.message} {...register("message")} />
      {/* Honeypot — hidden from humans, filled by bots */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />
      <FormError message={error} />
      <Button type="submit" size="lg" arrow loading={submitting} className="h-[68px] w-full rounded-lg text-[1.3rem]">
        Send Message
      </Button>
      <p className="text-center text-[0.8rem] text-ink-500">
        By contacting us, you agree to our{" "}
        <Link to="/privacy" className="underline underline-offset-2 hover:text-forest-900">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link to="/terms" className="underline underline-offset-2 hover:text-forest-900">
          Terms of Service
        </Link>
        .
      </p>
    </form>
  );
}
