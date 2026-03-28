import { deleteSession, getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Get the current session to retrieve the access token
        const session = await getSession();

        // If there's a session, try to call the backend logout API
        if (session?.accessToken) {
            try {
                const apiBaseUrl = process.env.API_SERVER_BASE_URL;

                // Call the backend logout endpoint (fire and forget - don't wait for response)
                await fetch(`${apiBaseUrl}/v1/logout/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                    body: JSON.stringify({
                        refresh: session.refreshToken,
                    }),
                }).catch((err) => {
                    // Log error but continue with local logout
                    console.error("Backend logout API error:", err);
                });
            } catch (error) {
                // Log error but continue with local logout
                console.error("Error calling backend logout:", error);
            }
        }

        // Delete the session cookie
        await deleteSession();

        return NextResponse.json(
            { message: "Logged out successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
