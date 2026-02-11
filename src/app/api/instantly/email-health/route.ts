import { NextResponse } from "next/server";
import { getEmailHealthSummary } from "@/services/instantly/email-health";

export async function GET(): Promise<NextResponse> {
    try {
        const result = await getEmailHealthSummary();

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            summary: result.summary,
            accounts: result.accounts,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to fetch email health: ${message}` },
            { status: 500 }
        );
    }
}
