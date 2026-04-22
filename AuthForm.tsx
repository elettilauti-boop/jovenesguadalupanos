"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { ensureUserProfile } from "@/lib/users";
import Spinner from "@/components/ui/Spinner";

type AuthMode = "login" | "register";

function mapAuthError(error: unknown) {
  const firebaseError = error as AuthError & { code?: string };

  switch (firebaseError?.code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again in a moment.";
    case "auth/operation-not-allowed":
      return "Email/password login is disabled in Firebase Auth. Enable it in Sign-in method.";
    case "permission-denied":
      return "Firestore blocked this action. Update Firestore rules for users/{uid}.";
    case "failed-precondition":
      return "Firebase is not fully configured yet. Check Authentication and Firestore setup.";
    default:
      return `Something went wrong. ${firebaseError?.code ? `Code: ${firebaseError.code}` : ""}`.trim();
  }
}

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create your account"),
    [mode]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const auth = getFirebaseAuth();

      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserProfile(credential.user.uid, credential.user.email ?? email);
      } else {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await ensureUserProfile(credential.user.uid, credential.user.email ?? email);
      }

      router.replace("/dashboard");
    } catch (submitError) {
      setError(mapAuthError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card-surface w-full max-w-md rounded-3xl p-8 sm:p-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Youth Digital Profile</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {mode === "login"
            ? "Log in to continue to your dashboard."
            : "Sign up and create your personal profile."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            required
            type="password"
            value={password}
          />
        </div>

        {mode === "register" ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              id="confirmPassword"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="********"
              required
              type="password"
              value={confirmPassword}
            />
          </div>
        ) : null}

        {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}

        <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner size="sm" />
              Processing
            </span>
          ) : mode === "login" ? (
            "Login"
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <button
          className="font-semibold text-teal-700 transition hover:text-teal-800"
          onClick={() => {
            setError("");
            setMode(mode === "login" ? "register" : "login");
          }}
          type="button"
        >
          {mode === "login" ? "Register" : "Login"}
        </button>
      </div>
    </section>
  );
}
