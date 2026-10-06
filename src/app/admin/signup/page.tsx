import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame, NotConfigured } from "@/components/admin/AdminShell";
import { SignupForm } from "@/components/admin/AuthForms";
import { isAdminConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  if (!isAdminConfigured()) return <NotConfigured />;

  return (
    <AuthFrame
      title="Create an account"
      intro="Use your email address and choose a password."
      footer={
        <>
          Already have an account? <Link href="/admin/login">Sign in</Link>
        </>
      }
    >
      <SignupForm />
    </AuthFrame>
  );
}
