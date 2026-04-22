import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

function userRef(uid: string) {
  return doc(getFirestoreDb(), "users", uid);
}

function normalizeProfile(uid: string, raw: Record<string, unknown>, email = ""): UserProfile {
  return {
    uid,
    email: String(raw.email ?? email ?? ""),
    name: String(raw.name ?? ""),
    bio: String(raw.bio ?? ""),
    profileImageUrl: String(raw.profileImageUrl ?? "")
  };
}

export async function ensureUserProfile(uid: string, email = ""): Promise<UserProfile> {
  const ref = userRef(uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const profile: UserProfile = {
      uid,
      email,
      name: "",
      bio: "",
      profileImageUrl: ""
    };

    await setDoc(ref, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return profile;
  }

  return normalizeProfile(uid, snapshot.data() ?? {}, email);
}

export async function getUserProfile(uid: string, email = ""): Promise<UserProfile> {
  return ensureUserProfile(uid, email);
}

export async function updateUserProfile(
  uid: string,
  payload: Partial<Pick<UserProfile, "name" | "bio" | "profileImageUrl" | "email">>
) {
  const ref = userRef(uid);

  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp()
  });
}
