import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema } from "@maidhire/shared";
import { z } from "zod";
import { Logo } from "@/components/ui/Logo";
import { Input, FormError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { useAdminLogin, useAdminMe } from "@/lib/admin";
import { Seo } from "@/components/ui/Seo";
import { ApiRequestError } from "@/lib/api";

type Form = z.infer<typeof adminLoginSchema>;

export default function LoginPage() {
  const { data: me } = useAdminMe();
  const login = useAdminLogin();
  const navigate = useNavigate();
  const [err, setErr] = useState<string>();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(adminLoginSchema) });
  if (me) return <Navigate to="/admin" replace />;
  return (
    <div className="flex min-h-dvh items-center justify-center bg-forest-950 px-4">
      <Seo title="Admin Login" noIndex />
      <div className="w-full max-w-sm rounded-2xl bg-cream-50 p-8 shadow-lift">
        <Logo tone="dark" asLink={false} />
        <h1 className="h-serif mt-6 text-2xl text-ink-950">Admin sign in</h1>
        <form
          noValidate
          className="mt-6 space-y-4"
          onSubmit={handleSubmit((data) => {
            setErr(undefined);
            login.mutate(data, {
              onSuccess: () => navigate("/admin", { replace: true }),
              onError: (e) => setErr(e instanceof ApiRequestError ? e.message : "Could not sign in"),
            });
          })}
        >
          <Input label="Email" type="email" autoComplete="username" error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
          <FormError message={err} />
          <Button type="submit" size="lg" loading={login.isPending} className="w-full rounded-lg">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
