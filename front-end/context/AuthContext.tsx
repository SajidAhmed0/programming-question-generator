"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { FirebaseError } from "firebase/app";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";
import { getUserLevel } from "@/actions/user";
import useUserStore from "@/store/user";
import useQuizStore from "@/store/quiz";
import { Difficulty } from "@/types";
import { doc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
const login = async (email: string, password: string) => {
  const loginToastId = "login-toast";
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log(userCredential);
    const userLevel = await getUserLevel(userCredential.user.uid);
    useUserStore.setState({
      userLevel: userLevel.data?.level as Difficulty,
    });

    toast.success("Login successful", { id: loginToastId });
    setTimeout(() => {
      redirect("/");
    }, 500);
  } catch (error) {
    if (error instanceof FirebaseError) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(
        "Error code: " + errorCode + " Error message: " + errorMessage
      );

      if (errorCode === "auth/wrong-password") {
        toast.error("Wrong password", { id: loginToastId });
      } else if (errorCode === "auth/invalid-credential") {
        toast.error("Invalid credential", { id: loginToastId });
      } else if (errorCode === "auth/user-not-found") {
        toast.error("User not found", { id: loginToastId });
      } else {
        toast.error("Something went wrong", { id: loginToastId });
      }
    }
  }
};

const logout = () => {
  useUserStore.getState().clearUserStore();
  useQuizStore.getState().clearStore();
  localStorage.clear();
  sessionStorage.clear();
  signOut(auth);
};

const createUser = async (name: string, email: string, password: string) => {
  await createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, {
        name: name,
      });

      toast.success("User created successfully");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log(
        "Error code: " + errorCode + " Error message: " + errorMessage
      );

      if (errorCode === "auth/email-already-in-use") {
        toast.error("Email already in use");
      } else if (errorCode === "auth/invalid-email") {
        toast.error("Invalid email");
      } else {
        toast.error("Something went wrong");
      }
    });
};

const AuthContext = createContext({
  user: null as User | null,
  isLoading: true,
  login,
  logout,
  createUser,
});
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, createUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
