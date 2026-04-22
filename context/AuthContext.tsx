"use client";

import {
  User,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { getFirebaseAuth } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};

    const initAuth = async () => {
      const auth = getFirebaseAuth();

      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch {
        // no-op fallback to SDK defaults
      }

      unsub = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
    };

    initAuth();

    return () => {
      unsub();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
