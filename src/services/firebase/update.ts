"use client";

// External Imports
import { deleteField, doc, FieldValue, updateDoc } from "firebase/firestore";

// Local Imports
import { auth, firestore } from "@/lib/firebase/config";
import { usersCol } from "@/utils/constants";
import { IUser } from "@/models/user";


export async function updateOnboarding({ firstname, lastname }: { firstname: string, lastname: string }) {
    try {
        const user = auth.currentUser;

        if (!user || !user.email) {
            throw new Error("No authenticated user found.");
        }

        const userRef = doc(firestore, usersCol, user.uid);

        const updatePayload: { [x: string]: FieldValue | Partial<unknown> | undefined; } = {
            firstname,
            lastname,
            "authentication.onboarding": deleteField(),
        }

        await updateDoc(userRef, updatePayload);
    } catch (error) {
        console.error("Failed to update onboarding info:", error);
        throw error;
    }
}


export async function updateUser({ user }: { user: IUser }) {
    try {
        const { id, ...updatableFields } = user;

        const ref = doc(firestore, usersCol, id as string);
        await updateDoc(ref, updatableFields);

        return { success: true };
    } catch (error) {
        return { error: `${error}` };
    }
}