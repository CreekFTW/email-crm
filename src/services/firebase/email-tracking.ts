"use server";

import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { usersCol, sentEmailsCol } from "@/utils/constants";
import type { SentEmail } from "@/types/campaign";

interface SaveSentEmailParams {
    userId: string;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    body: string;
    campaignId: string;
    campaignName?: string;
    apolloId?: string;
    instantlyLeadId?: string;
    metadata?: Record<string, unknown>;
}

export async function saveSentEmail(params: SaveSentEmailParams): Promise<SentEmail | null> {
    const {
        userId,
        recipientEmail,
        recipientName,
        subject,
        body,
        campaignId,
        campaignName,
        apolloId,
        instantlyLeadId,
        metadata,
    } = params;

    try {
        const timestamp = Date.now();
        const docId = `email_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

        const sentEmail: SentEmail = {
            id: docId,
            recipientEmail,
            recipientName,
            subject,
            body,
            campaignId,
            campaignName,
            sentAt: timestamp,
            status: "sent",
            apolloId,
            instantlyLeadId,
            metadata,
        };

        await firestoreAdmin
            .collection(usersCol)
            .doc(userId)
            .collection(sentEmailsCol)
            .doc(docId)
            .set(sentEmail);

        console.log(`[Email Tracking] Saved sent email to ${recipientEmail}`);

        return sentEmail;
    } catch (error) {
        console.error(`[Email Tracking] Error saving sent email:`, error);
        return null;
    }
}

interface GetSentEmailsParams {
    userId: string;
    limit?: number;
    startAfter?: number;
    campaignId?: string;
    recipientEmail?: string;
}

export async function getSentEmails(params: GetSentEmailsParams): Promise<{
    emails: SentEmail[];
    hasMore: boolean;
}> {
    const { userId, limit = 50, startAfter, campaignId, recipientEmail } = params;

    try {
        let query = firestoreAdmin
            .collection(usersCol)
            .doc(userId)
            .collection(sentEmailsCol)
            .orderBy("sentAt", "desc");

        if (campaignId) {
            query = query.where("campaignId", "==", campaignId);
        }

        if (recipientEmail) {
            query = query.where("recipientEmail", "==", recipientEmail);
        }

        if (startAfter) {
            query = query.startAfter(startAfter);
        }

        query = query.limit(limit + 1);

        const snapshot = await query.get();
        const emails: SentEmail[] = [];

        snapshot.docs.slice(0, limit).forEach((doc) => {
            emails.push(doc.data() as SentEmail);
        });

        return {
            emails,
            hasMore: snapshot.docs.length > limit,
        };
    } catch (error) {
        console.error(`[Email Tracking] Error fetching sent emails:`, error);
        return { emails: [], hasMore: false };
    }
}

export async function getSentEmailsByLead(
    userId: string,
    recipientEmail: string
): Promise<SentEmail[]> {
    const result = await getSentEmails({
        userId,
        recipientEmail,
        limit: 100,
    });

    return result.emails;
}

export async function updateEmailStatus(
    userId: string,
    emailId: string,
    status: SentEmail["status"]
): Promise<boolean> {
    try {
        await firestoreAdmin
            .collection(usersCol)
            .doc(userId)
            .collection(sentEmailsCol)
            .doc(emailId)
            .update({ status });

        return true;
    } catch (error) {
        console.error(`[Email Tracking] Error updating email status:`, error);
        return false;
    }
}
