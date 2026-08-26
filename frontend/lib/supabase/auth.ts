import "server-only";
import type { NextRequest } from "next/server";
import { getSupabaseServerClient } from "./server";

export function getAccessTokenFromRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
}

export async function getAuthenticatedUser(request: NextRequest) {
  const accessToken = getAccessTokenFromRequest(request);
  if (!accessToken) {
    return null;
  }

  const { data, error } = await getSupabaseServerClient().auth.getUser(accessToken);
  return error ? null : data.user;
}
