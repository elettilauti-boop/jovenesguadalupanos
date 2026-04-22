"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/forms/AuthForm";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  if (loading) {
    return <LoadingScreen label="Loading session..." />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <AuthForm />
    </main>
  );
}
