import { redirect } from "next/navigation";

// Redirect /admin directly to /admin/users
export default function AdminPage() {
  redirect("/admin/users");
}