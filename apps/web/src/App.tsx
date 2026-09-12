import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { CurrencyProvider } from "@/hooks/useCurrency";
import HomePage from "@/pages/HomePage";
import { Spinner } from "@/components/ui/Spinner";

/* Route-level code splitting: only the home page ships in the initial bundle. */
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const HowItWorksPage = lazy(() => import("@/pages/HowItWorksPage"));
const CandidatesPage = lazy(() => import("@/pages/CandidatesPage"));
const CandidateProfilePage = lazy(() => import("@/pages/CandidateProfilePage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const JoinPage = lazy(() => import("@/pages/JoinPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));

const AdminShell = lazy(() => import("@/components/admin/AdminShell").then((m) => ({ default: m.AdminShell })));
const AdminLoginPage = lazy(() => import("@/pages/admin/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const CandidatesAdminPage = lazy(() => import("@/pages/admin/CandidatesAdminPage"));
const CandidateAdminDetailPage = lazy(() => import("@/pages/admin/CandidateAdminDetailPage"));
const RequestsAdminPage = lazy(() => import("@/pages/admin/RequestsAdminPage"));
const MessagesAdminPage = lazy(() => import("@/pages/admin/MessagesAdminPage"));
const PlansAdminPage = lazy(() => import("@/pages/admin/PlansAdminPage"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const router = createBrowserRouter(
  [
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/services", element: <ServicesPage /> },
      { path: "/how-it-works", element: <HowItWorksPage /> },
      { path: "/candidates", element: <CandidatesPage /> },
      { path: "/candidates/:slug", element: <CandidateProfilePage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/join", element: <JoinPage /> },
      { path: "/privacy", element: <LegalPage kind="privacy" /> },
      { path: "/terms", element: <LegalPage kind="terms" /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/admin/login", element: <AdminLoginPage /> },
  {
    path: "/admin",
    element: <AdminShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "candidates", element: <CandidatesAdminPage /> },
      { path: "candidates/:id", element: <CandidateAdminDetailPage /> },
      { path: "requests", element: <RequestsAdminPage /> },
      { path: "messages", element: <MessagesAdminPage /> },
      { path: "plans", element: <PlansAdminPage /> },
    ],
  },
  ],
  { future: { v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true, v7_skipActionErrorRevalidation: true } },
);

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <Suspense fallback={<div className="min-h-dvh bg-cream-100"><Spinner /></div>}>
            <RouterProvider router={router} future={{ v7_startTransition: true }} />
          </Suspense>
        </CurrencyProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
