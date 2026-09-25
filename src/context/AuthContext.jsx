import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  githubProvider,
  microsoftProvider,
  isFirebaseConfigured,
} from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const withAuthAction = useCallback(async (action) => {
    setAuthError(null);
    try {
      await action();
      return { ok: true };
    } catch (err) {
      const message = err?.message || "Authentication failed.";
      setAuthError(message);
      return { ok: false, message };
    }
  }, []);

  const signInWithGoogle = useCallback(
    () => withAuthAction(() => signInWithPopup(auth, googleProvider)),
    [withAuthAction],
  );
  const signInWithGithub = useCallback(
    () => withAuthAction(() => signInWithPopup(auth, githubProvider)),
    [withAuthAction],
  );
  const signInWithMicrosoft = useCallback(
    () => withAuthAction(() => signInWithPopup(auth, microsoftProvider)),
    [withAuthAction],
  );

  const signInWithEmail = useCallback(
    (email, password) =>
      withAuthAction(() => signInWithEmailAndPassword(auth, email, password)),
    [withAuthAction],
  );

  const registerWithEmail = useCallback(
    (email, password, name) =>
      withAuthAction(async () => {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        if (name) await updateProfile(credential.user, { displayName: name });
      }),
    [withAuthAction],
  );

  const logOut = useCallback(() => signOut(auth), []);

  const value = {
    firebaseUser,
    authLoading,
    authError,
    isFirebaseConfigured,
    signInWithGoogle,
    signInWithGithub,
    signInWithMicrosoft,
    signInWithEmail,
    registerWithEmail,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
