import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema } from "@maidhire/shared";
import { z } from "zod";
import { LayoutDashboard, ShieldCheck, Users2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input, FormError } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { useAdminLogin, useAdminMe } from "@/lib/admin";
import { Seo } from "@/components/ui/Seo";
import { ApiRequestError } from "@/lib/api";

type Form = z.infer<typeof adminLoginSchema>;

const ADMIN_TRUST = [
  { Icon: LayoutDashboard, text: "Full candidate & pipeline control" },
  { Icon: Users2, text: "Hire requests & messages in one place" },
  { Icon: ShieldCheck, text: "Cookie-JWT session, CSRF-protected" },
];

export default function LoginPage() {
  const { data: me } = useAdminMe();
  const login = useAdminLogin();
  const navigate = useNavigate();
  const [err, setErr] = useState<string>();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(adminLoginSchema) });
  if (me) return <Navigate to="/admin" replace />;
  return (
    <AuthLayout eyebrow="MaidHire Admin" heading="Manage the Whole Pipeline" description="Candidates, hire requests, messages and plans — all in one console." trustItems={ADMIN_TRUST}>
      <Seo title="Admin Login" noIndex />
      <h1 className="h-serif text-[2.1rem] text-ink-950">Admin Sign In</h1>
      <p className="mt-1.5 text-ink-500">Log in with your MaidHire admin credentials.</p>
      <form
        noValidate
        className="mt-7 space-y-4"
        onSubmit={handleSubmit((data) => {
          setErr(undefined);
          login.mutate(data, {
            onSuccess: () => navigate("/admin", { replace: true }),
            onError: (e) => setErr(e instanceof ApiRequestError ? e.message : "Could not sign in"),
          });
        })}
      >
        <Input label="Email" hideLabel type="email" autoComplete="username" placeholder="Email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" hideLabel type="password" autoComplete="current-password" placeholder="Password" error={errors.password?.message} {...register("password")} />
        <FormError message={err} />
        <Button type="submit" size="lg" loading={login.isPending} arrow className="w-full rounded-xl">
          Sign In
        </Button>
      </form>
    </AuthLayout>
  );
}
