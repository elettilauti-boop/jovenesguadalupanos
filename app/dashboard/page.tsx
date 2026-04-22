"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

function DashboardContent() {
  const { user } = useAuth();
  const firstPart = user?.email?.split("@")[0] ?? "friend";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <section className="card-surface rounded-3xl p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Dashboard</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-slate-900">Welcome, {firstPart}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            This is your private space. Manage your digital identity, update your profile, and keep everything
            organized in one place.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-heading text-lg font-semibold text-slate-900">Profile completion</h2>
              <p className="mt-1 text-sm text-slate-600">Add your name, bio, and profile picture to complete it.</p>
              <Link className="btn-primary mt-4" href="/profile">
                Go to profile
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-heading text-lg font-semibold text-slate-900">Quick access</h2>
              <p className="mt-1 text-sm text-slate-600">
                Your profile page has live preview and instant image upload.
              </p>
              <Link className="btn-secondary mt-4" href="/profile">
                Edit profile
              </Link>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
