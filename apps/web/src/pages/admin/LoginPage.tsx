import { Navigate } from "react-router-dom";

/** Old admin login URL — the unified /login page now handles all three roles via a tab. */
export default function LoginPage() {
  return <Navigate to="/login?as=admin" replace />;
}
