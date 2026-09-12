import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Seo } from "@/components/ui/Seo";

/** Password-reset emails aren't wired up yet — points people to support in the meantime. */
export default function ForgotPasswordPage() {
  return (
    <AuthLayout eyebrow="Account Recovery" heading="We've Got You Covered" description="Password resets for family accounts are on the way.">
      <Seo title="Forgot Password" noIndex />
      <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-forest-900/6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-100">
          <Mail aria-hidden="true" className="h-6 w-6 text-forest-900" />
        </span>
        <h1 className="h-serif mt-5 text-[1.6rem] text-ink-950">Password Reset Coming Soon</h1>
        <p className="mt-2 text-ink-500">
          Self-serve password reset isn&apos;t live yet. Email us at{" "}
          <a href="mailto:hello@maidhire.com" className="font-semibold text-forest-900 hover:underline">
            hello@maidhire.com
          </a>{" "}
          and we&apos;ll help you back into your account.
        </p>
        <Button to="/login" variant="outline" size="lg" className="mt-6 w-full rounded-xl">
          Back to Log In
        </Button>
      </div>
      <p className="mt-6 text-center text-[0.9rem] text-ink-500">
        <Link to="/signup" className="font-semibold text-forest-900 hover:underline">
          Create a new account
        </Link>{" "}
        instead
      </p>
    </AuthLayout>
  );
}
