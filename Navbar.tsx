"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/ui/Spinner";

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(getFirebaseAuth());
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link className="font-heading text-lg font-semibold text-slate-900" href="/dashboard">
          Youth Profile
        </Link>

        <div className="flex items-center gap-2">
          <Link className="btn-secondary" href="/dashboard">
            Dashboard
          </Link>
          <Link className="btn-secondary" href="/profile">
            Profile
          </Link>
          <button className="btn-primary min-w-24" disabled={isLoggingOut} onClick={handleLogout} type="button">
            {isLoggingOut ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" />
                Logging out
              </span>
            ) : (
              "Logout"
            )}
          </button>
        </div>
      </div>
      {user?.email ? (
        <p className="mx-auto w-full max-w-5xl px-4 pb-3 text-xs font-medium text-slate-500">{user.email}</p>
      ) : null}
    </header>
  );
}
