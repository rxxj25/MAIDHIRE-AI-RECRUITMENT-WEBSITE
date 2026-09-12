import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guestLoginSchema } from "@maidhire/shared";
import { z } from "zod";
import { Leaf } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Input, FormError, Checkbox } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { useGuestLogin, useGuestMe } from "@/lib/guestAuth";
import { ApiRequestError } from "@/lib/api";
import { Seo } from "@/components/ui/Seo";

type Form = z.infer<typeof guestLoginSchema>;

export default function LoginPage() {
  const { data: me } = useGuestMe();
  const login = useGuestLogin();
  const navigate = useNavigate();
  const [err, setErr] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(guestLoginSchema) });

  if (me) return <Navigate to="/" replace />;

  return (
    <AuthLayout>
      <Seo title="Log In" noIndex />

      <div className="flex justify-end text-[0.92rem] text-ink-500">
        Don&apos;t have an account?&nbsp;
        <Link to="/signup" className="font-semibold text-forest-900 hover:underline">
          Sign Up
        </Link>
      </div>

      <h1 className="h-serif mt-5 text-[2.1rem] text-ink-950">Welcome Back</h1>
      <p className="mt-1.5 text-ink-500">Log in to continue to a cleaner, happier home.</p>

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
          login.mutate(data, {
            onSuccess: () => navigate("/", { replace: true }),
            onError: (e) => setErr(e instanceof ApiRequestError ? e.message : "Could not sign in"),
          });
        })}
      >
        <Input label="Email address" hideLabel type="email" autoComplete="username" placeholder="Email address" error={errors.email?.message} {...register("email")} />
        <Input label="Password" hideLabel type="password" autoComplete="current-password" placeholder="Password" error={errors.password?.message} {...register("password")} />

        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" defaultChecked />
          <Link to="/forgot-password" className="text-[0.9rem] font-semibold text-forest-900 hover:underline">
            Forgot password?
          </Link>
        </div>

        <FormError message={err} />

        <Button type="submit" size="lg" loading={login.isPending} arrow className="w-full rounded-xl">
          Log In
        </Button>
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
