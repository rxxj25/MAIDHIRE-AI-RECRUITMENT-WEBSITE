import { useState } from "react";
import { Navigate, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, candidateLoginSchema, guestLoginSchema } from "@maidhire/shared";
import { z } from "zod";
import { Leaf } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Input, FormError, Checkbox } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { useGuestLogin, useGuestMe } from "@/lib/guestAuth";
import { useAdminLogin, useAdminMe } from "@/lib/admin";
import { useCandidateLogin, useCandidateMe } from "@/lib/candidateAuth";
import { ApiRequestError } from "@/lib/api";
import { Seo } from "@/components/ui/Seo";
import { cn } from "@/lib/utils";

type Role = "user" | "admin" | "candidate";
const ROLES: { key: Role; label: string }[] = [
  { key: "user", label: "Family" },
  { key: "candidate", label: "Candidate" },
  { key: "admin", label: "Admin" },
];

function RoleTabs({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div role="tablist" aria-label="Log in as" className="inline-flex rounded-full bg-cream-200 p-1">
      {ROLES.map((r) => (
        <button
          key={r.key}
          type="button"
          role="tab"
          aria-selected={role === r.key}
          onClick={() => onChange(r.key)}
          className={cn(
            "h-9 rounded-full px-4 text-[0.85rem] font-semibold transition-colors",
            role === r.key ? "bg-forest-900 text-white" : "text-ink-700 hover:text-forest-900",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

type UserForm = z.infer<typeof guestLoginSchema>;

function UserLoginForm() {
  const login = useGuestLogin();
  const navigate = useNavigate();
  const [err, setErr] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserForm>({ resolver: zodResolver(guestLoginSchema) });

  return (
    <>
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
    </>
  );
}

type CandidateForm = z.infer<typeof candidateLoginSchema>;

function CandidateLoginForm() {
  const login = useCandidateLogin();
  const navigate = useNavigate();
  const [err, setErr] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateForm>({ resolver: zodResolver(candidateLoginSchema) });

  return (
    <form
      noValidate
      className="mt-7 space-y-4"
      onSubmit={handleSubmit((data) => {
        setErr(undefined);
        login.mutate(data, {
          onSuccess: () => navigate("/candidate/status", { replace: true }),
          onError: (e) => setErr(e instanceof ApiRequestError ? e.message : "Could not sign in"),
        });
      })}
    >
      <Input label="Email address" hideLabel type="email" autoComplete="username" placeholder="Email address" error={errors.email?.message} {...register("email")} />
      <Input label="Password" hideLabel type="password" autoComplete="current-password" placeholder="Password" error={errors.password?.message} {...register("password")} />
      <FormError message={err} />
      <Button type="submit" size="lg" loading={login.isPending} arrow className="w-full rounded-xl">
        Log In
      </Button>
      <p className="text-center text-[0.9rem] text-ink-500">
        Haven&apos;t applied yet?{" "}
        <Link to="/join" className="font-semibold text-forest-900 hover:underline">
          Apply as a candidate
        </Link>
      </p>
    </form>
  );
}

type AdminForm = z.infer<typeof adminLoginSchema>;

function AdminLoginForm() {
  const login = useAdminLogin();
  const navigate = useNavigate();
  const [err, setErr] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminForm>({ resolver: zodResolver(adminLoginSchema) });

  return (
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
  );
}

const COPY: Record<Role, { heading: string; description: string }> = {
  user: { heading: "Welcome Back", description: "Log in to continue to a cleaner, happier home." },
  candidate: { heading: "Welcome Back", description: "Log in to check your application status." },
  admin: { heading: "Admin Sign In", description: "Log in with your MaidHire admin credentials." },
};

export default function LoginPage() {
  const [params] = useSearchParams();
  const initial = params.get("as");
  const [role, setRole] = useState<Role>(initial === "admin" || initial === "candidate" ? initial : "user");

  const { data: guestMe } = useGuestMe();
  const { data: adminMe } = useAdminMe();
  const { data: candidateMe } = useCandidateMe();

  if (role === "user" && guestMe) return <Navigate to="/" replace />;
  if (role === "admin" && adminMe) return <Navigate to="/admin" replace />;
  if (role === "candidate" && candidateMe) return <Navigate to="/candidate/status" replace />;

  return (
    <AuthLayout>
      <Seo title="Log In" noIndex />

      <div className="flex items-center justify-between gap-3">
        <RoleTabs role={role} onChange={setRole} />
        {role === "user" && (
          <span className="text-[0.92rem] text-ink-500">
            <Link to="/signup" className="font-semibold text-forest-900 hover:underline">
              Sign Up
            </Link>
          </span>
        )}
      </div>

      <h1 className="h-serif mt-5 text-[2.1rem] text-ink-950">{COPY[role].heading}</h1>
      <p className="mt-1.5 text-ink-500">{COPY[role].description}</p>

      {role === "user" && <UserLoginForm />}
      {role === "candidate" && <CandidateLoginForm />}
      {role === "admin" && <AdminLoginForm />}

      {role !== "admin" && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-mint-100 px-5 py-4 ring-1 ring-mint-300/70">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-300">
            <Leaf aria-hidden="true" className="h-4.5 w-4.5 text-forest-900" />
          </span>
          <p className="text-[0.92rem] font-semibold leading-snug text-forest-950">
            A cleaner home
            <br />A brighter you
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
