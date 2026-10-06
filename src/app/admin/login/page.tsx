import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame, NotConfigured } from "@/components/admin/AdminShell";
import { LoginForm } from "@/components/admin/AuthForms";
import { isAdminConfigured } from "@/lib/supabase/config";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string }>;
}) {
  if (!isAdminConfigured()) return <NotConfigured />;
  const { confirmed } = await searchParams;

  return (
    <AuthFrame
      title="Sign in"
      intro="Sign in to your Nexgen account."
      footer={
        <>
          No account yet? <Link href="/admin/signup">Create one</Link>
        </>
      }
    >
      {confirmed && (
        <p className={styles.formSuccess} role="status">
          Email address confirmed. Sign in below.
        </p>
      )}
      <LoginForm />
    </AuthFrame>
  );
}
