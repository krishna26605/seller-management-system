import { redirect } from "next/navigation";

/**
 * ROOT PAGE
 * =========
 * Redirects to admin login by default.
 * In a real app, this could check cookies server-side and redirect accordingly.
 */
export default function Home() {
  redirect("/admin/login");
}
