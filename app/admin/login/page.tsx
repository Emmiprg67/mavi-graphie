import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { brand } from "@/data/siteContent";

export const metadata: Metadata = {
  title: "Admin Login",
  description: `Geschuetzter Login fuer den Adminbereich von ${brand.name}.`,
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
