import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Only run on pages that depend on the login state
export const config = {
  matcher: [
    "/account/:path*",
    "/seller/:path*",
    "/admin/:path*",
    "/checkout/:path*",
    "/login",
    "/signup",
  ],
};
