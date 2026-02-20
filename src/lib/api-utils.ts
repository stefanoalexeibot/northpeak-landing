import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Wrapper that verifies admin authentication before running the handler.
 * Eliminates duplicated auth logic across admin API routes.
 *
 * Usage:
 *   export const POST = withAdminAuth(async (req, supabase, user) => {
 *     // your handler logic here
 *     return NextResponse.json({ ok: true });
 *   });
 */
export function withAdminAuth(
    handler: (
        request: Request,
        supabase: ReturnType<typeof createClient>,
        user: { id: string; email?: string }
    ) => Promise<NextResponse>
) {
    return async (request: Request) => {
        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                return NextResponse.json(
                    { error: "No autenticado" },
                    { status: 401 }
                );
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role !== "admin") {
                return NextResponse.json(
                    { error: "No autorizado" },
                    { status: 403 }
                );
            }

            return await handler(request, supabase, {
                id: user.id,
                email: user.email,
            });
        } catch (error) {
            console.error("API error:", error);
            return NextResponse.json(
                { error: "Error interno del servidor" },
                { status: 500 }
            );
        }
    };
}
