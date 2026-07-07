import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { supabase as supabaseBrowserClient } from "./client";
import type { Database } from "./types";

type JwtClaims = {
  sub?: string;
  app_metadata?: { role?: string; [key: string]: unknown };
  [key: string]: unknown;
};

async function validateBearerToken() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Response(
      "Missing Supabase environment variables. Ensure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are set.",
      { status: 500 },
    );
  }

  const request = getRequest();

  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response("Unauthorized: No bearer token provided", { status: 401 });
  }

  const token = authHeader.slice("Bearer ".length);
  if (!token) {
    throw new Response("Unauthorized: No token provided", { status: 401 });
  }

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) {
    throw new Response("Unauthorized: Invalid token", { status: 401 });
  }

  const claims = data.claims as JwtClaims;
  if (!claims.sub) {
    throw new Response("Unauthorized: No user ID found in token", { status: 401 });
  }

  return { supabase, userId: claims.sub, claims };
}

// Attaches the current Supabase session token to server function calls.
// The session lives only in the browser, so on the server we forward nothing
// and let the server-side validation reject the request.
const attachSupabaseToken = async (): Promise<Record<string, string>> => {
  if (typeof window === "undefined") return {};
  const { data } = await supabaseBrowserClient.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Requires a valid Supabase session. Provides `userId` and `claims` in context.
export const requireSupabaseAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => next({ headers: await attachSupabaseToken() }))
  .server(async ({ next }) => {
    const { supabase, userId, claims } = await validateBearerToken();
    return next({
      context: { supabase, userId, claims },
    });
  });

// Requires a valid Supabase session belonging to an admin
// (app_metadata.role === 'admin' on the Auth user).
export const requireAdmin = createMiddleware({ type: "function" })
  .client(async ({ next }) => next({ headers: await attachSupabaseToken() }))
  .server(async ({ next }) => {
    const { supabase, userId, claims } = await validateBearerToken();
    if (claims.app_metadata?.role !== "admin") {
      throw new Response("Forbidden: Admin role required", { status: 403 });
    }
    return next({
      context: { supabase, userId, claims },
    });
  });
