export type EmailVerification = "unverified" | "verifying" | "verified";


interface IUser {
    authentication?: IAuthentication | null;
    email?: string | null;
    id?: string | null;
    firstname?: string | null;
    lastname?: string | null;
    metadata?: IMetaData;
}

interface IAuthentication {
    emailVerified?: EmailVerification;
    onboarding?: boolean | null;
}


interface IMetaData {
    createdAt?: number | null;
}


export type { IUser }