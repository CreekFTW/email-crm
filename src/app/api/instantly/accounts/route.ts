import { NextResponse } from "next/server";
import { getEmailAccounts } from "@/services/instantly/campaign-management";

export async function GET(): Promise<NextResponse> {
    try {
        const result = await getEmailAccounts();

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            accounts: result.accounts,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to fetch accounts: ${message}` },
            { status: 500 }
        );
    }
}
