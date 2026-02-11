"use server";

// Local Imports
import { IUser } from "@/models/user";
import { usersCol } from "@/utils/constants";
import { firestoreAdmin } from "@/lib/firebase/config-admin";


export async function createUser({ uid, email }: { uid: string, email: string }): Promise<IUser | void> {
    try {
        // Get the user document reference
        const userRef = firestoreAdmin.collection(usersCol).doc(uid);

        const now = new Date();

        const user: IUser = {
            id: uid,
            email,
            authentication: {
                emailVerified: 'verified',
            },
            metadata: {
                createdAt: now.getTime()
            }
        }


        await userRef.set(user);

        return user;
    } catch (error) {
        console.error('Error creating user in Firestore:', error);
    }
}