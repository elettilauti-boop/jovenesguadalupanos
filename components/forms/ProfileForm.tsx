"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseStorage } from "@/lib/firebase";
import { getUserProfile, updateUserProfile } from "@/lib/users";
import Spinner from "@/components/ui/Spinner";

const MAX_BIO_LENGTH = 220;
const MAX_IMAGE_SIZE_MB = 5;

type ProfileState = {
  name: string;
  bio: string;
  profileImageUrl: string;
};

function initialsFromName(name: string, email: string) {
  const cleanName = name.trim();
  if (cleanName.length > 0) {
    return cleanName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

export default function ProfileForm() {
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileState>({
    name: "",
    bio: "",
    profileImageUrl: ""
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const currentBlobUrl = useRef<string | null>(null);

  const email = user?.email ?? "";
  const initials = useMemo(() => initialsFromName(form.name, email), [email, form.name]);

  useEffect(() => {
    if (!user?.uid) return;

    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        setError("");
        const profile = await getUserProfile(user.uid, user.email ?? "");

        setForm({
          name: profile.name,
          bio: profile.bio,
          profileImageUrl: profile.profileImageUrl
        });
        setPreviewUrl(profile.profileImageUrl);
      } catch {
        setError("Could not load your profile. Refresh and try again.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user?.email, user?.uid]);

  useEffect(() => {
    return () => {
      if (currentBlobUrl.current) {
        URL.revokeObjectURL(currentBlobUrl.current);
      }
    };
  }, []);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setSuccess("");

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
    }

    const localBlobUrl = URL.createObjectURL(file);
    currentBlobUrl.current = localBlobUrl;

    setSelectedFile(file);
    setPreviewUrl(localBlobUrl);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.uid) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      let profileImageUrl = form.profileImageUrl;

      if (selectedFile) {
        const storageRef = ref(getFirebaseStorage(), `profiles/${user.uid}/${Date.now()}-${selectedFile.name}`);
        const uploadResult = await uploadBytes(storageRef, selectedFile);
        profileImageUrl = await getDownloadURL(uploadResult.ref);
      }

      await updateUserProfile(user.uid, {
        email: user.email ?? "",
        name: form.name.trim(),
        bio: form.bio.trim(),
        profileImageUrl
      });

      setForm((prev) => ({
        ...prev,
        profileImageUrl
      }));
      setPreviewUrl(profileImageUrl);
      setSelectedFile(null);
      setSuccess("Profile updated successfully.");
    } catch {
      setError("Could not save your profile. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="card-surface flex min-h-[380px] items-center justify-center rounded-3xl p-10">
        <div className="flex items-center gap-3 text-slate-600">
          <Spinner />
          <span className="text-sm font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <article className="card-surface overflow-hidden rounded-3xl">
        <div className="h-28 bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300" />
        <div className="px-6 pb-7">
          <div className="-mt-12 flex items-end gap-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-slate-100 text-2xl font-bold text-slate-700">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="Profile preview" className="h-full w-full object-cover" src={previewUrl} />
              ) : (
                initials
              )}
            </div>
            <div className="pb-2">
              <h2 className="font-heading text-2xl font-semibold text-slate-900">
                {form.name.trim() || "Your Name"}
              </h2>
              <p className="text-sm text-slate-500">{email || "you@example.com"}</p>
            </div>
          </div>

          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {form.bio.trim() || "Your bio will appear here once you save your profile."}
          </p>
        </div>
      </article>

      <section className="card-surface rounded-3xl p-6 sm:p-8">
        <h3 className="font-heading text-xl font-semibold text-slate-900">Edit profile</h3>
        <p className="mt-1 text-sm text-slate-600">Update your details and profile image.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="name">
              Name
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              id="name"
              maxLength={60}
              onChange={(event) => {
                setSuccess("");
                setForm((prev) => ({ ...prev, name: event.target.value }));
              }}
              placeholder="Enter your name"
              required
              type="text"
              value={form.name}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="bio">
              Bio
            </label>
            <textarea
              className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              id="bio"
              maxLength={MAX_BIO_LENGTH}
              onChange={(event) => {
                setSuccess("");
                setForm((prev) => ({ ...prev, bio: event.target.value }));
              }}
              placeholder="Tell people about yourself..."
              value={form.bio}
            />
            <p className="text-right text-xs text-slate-500">{form.bio.length}/{MAX_BIO_LENGTH}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="avatar">
              Profile picture
            </label>
            <input
              accept="image/*"
              className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-800 hover:file:bg-teal-200"
              id="avatar"
              onChange={handleImageSelect}
              type="file"
            />
            <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB. Preview appears instantly.</p>
          </div>

          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
          {success ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{success}</p>
          ) : null}

          <button className="btn-primary w-full" disabled={isSaving} type="submit">
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" />
                Saving profile
              </span>
            ) : (
              "Save profile"
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
