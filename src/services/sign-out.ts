"use client"

// External Imports
import { signOut as nextSignOut } from "next-auth/react";
import { signOut as firebaseSignout } from "firebase/auth";

// Local Imports
import { auth } from "@/lib/firebase/config";
import { removeAllCookies } from "@/utils/cookie-handlers";

export async function signOut(redirect?: string) {
    removeAllCookies();
    await firebaseSignout(auth);
    await nextSignOut({ callbackUrl: redirect ? redirect : "https://appkarsilo.netlify.app", redirect: true })
}