import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guestSignupSchema } from "@maidhire/shared";
import { z } from "zod";
import { Leaf } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Input, FormError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { useGuestSignup, useGuestMe } from "@/lib/guestAuth";
import { ApiRequestError } from "@/lib/api";
import { Seo } from "@/components/ui/Seo";

type Form = z.infer<typeof guestSignupSchema>;

export default function SignupPage() {
  const { data: me } = useGuestMe();
  const signup = useGuestSignup();
  const navigate = useNavigate();
  const [err, setErr] = useState<string>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(guestSignupSchema) });

  if (me) return <Navigate to="/" replace />;

  return (
    <AuthLayout eyebrow="Join MaidHire" heading="Create Your Family Account" description="Sign up to save your details, track requests, and get matched faster next time.">
      <Seo title="Sign Up" noIndex />

      <div className="flex justify-end text-[0.92rem] text-ink-500">
        Already have an account?&nbsp;
        <Link to="/login" className="font-semibold text-forest-900 hover:underline">
          Log In
        </Link>
      </div>

      <h1 className="h-serif mt-5 text-[2.1rem] text-ink-950">Create Account</h1>
      <p className="mt-1.5 text-ink-500">Join MaidHire to manage your requests in one place.</p>

      <OAuthButtons className="mt-7" />

      <div className="my-6 flex items-center gap-4 text-[0.78rem] font-bold tracking-wide text-ink-400">
        <span className="h-px flex-1 bg-forest-900/12" aria-hidden="true" />
        OR
        <span className="h-px flex-1 bg-forest-900/12" aria-hidden="true" />
      </div>

      <form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit((data) => {
          setErr(undefined);
          signup.mutate(data, {
            onSuccess: () => navigate("/", { replace: true }),
            onError: (e) => {
              if (e instanceof ApiRequestError && e.fields) {
                for (const [field, message] of Object.entries(e.fields)) setError(field as keyof Form, { message });
              }
              setErr(e instanceof ApiRequestError ? e.message : "Could not create your account");
            },
          });
        })}
      >
        <Input label="Full name" hideLabel type="text" autoComplete="name" placeholder="Full Name" error={errors.name?.message} {...register("name")} />
        <Input label="Email address" hideLabel type="email" autoComplete="username" placeholder="Email address" error={errors.email?.message} {...register("email")} />
        <Input label="Password" hideLabel type="password" autoComplete="new-password" placeholder="Password" error={errors.password?.message} {...register("password")} />
        <Input
          label="Confirm password"
          hideLabel
          type="password"
          autoComplete="new-password"
          placeholder="Confirm Password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <FormError message={err} />

        <Button type="submit" size="lg" loading={signup.isPending} arrow className="w-full rounded-xl">
          Sign Up
        </Button>

        <p className="text-center text-[0.82rem] text-ink-400">
          By signing up, you agree to MaidHire&apos;s{" "}
          <Link to="/terms" className="underline hover:text-ink-700">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-ink-700">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <div className="mt-8 flex items-center gap-3 rounded-2xl bg-mint-100 px-5 py-4 ring-1 ring-mint-300/70">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-300">
          <Leaf aria-hidden="true" className="h-4.5 w-4.5 text-forest-900" />
        </span>
        <p className="text-[0.92rem] font-semibold leading-snug text-forest-950">
          A cleaner home
          <br />A brighter you
        </p>
      </div>
    </AuthLayout>
  );
}
