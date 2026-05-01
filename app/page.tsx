// This page's only job is to redirect based on role
// it never actually render anything visible

import { requireAuth } from "@/lib/services/authService";
import { redirect } from "next/navigation";

export default async function Rootpage() {
  const profile = await requireAuth();

  // Redirect based on role
  if (profile.role === "DOCTOR") redirect("/doctor/dashboard");
  if (profile.role === "ASSISTANT") redirect("/assistant/dashboard");
  if (profile.role === "PATIENT") redirect("/portal/dashboard");

  // Fallback
  redirect("/login")
}