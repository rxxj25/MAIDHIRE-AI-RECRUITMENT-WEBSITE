import { Seo } from "@/components/ui/Seo";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" noIndex />
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
        <p className="eyebrow text-forest-700">404</p>
        <h1 className="h-serif mt-3 text-[2.6rem] text-ink-950">We couldn't find that page</h1>
        <p className="mt-3 max-w-md text-ink-500">The link may be outdated. Let's get you back to finding the right help for your home.</p>
        <div className="mt-8 flex gap-3">
          <Button to="/" arrow>
            Go home
          </Button>
          <Button to="/candidates" variant="outline">
            Browse candidates
          </Button>
        </div>
      </div>
    </>
  );
}
