import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "./env.js";

let defaultClient: SupabaseClient | null = null;

export function getSupabaseClient(accessToken?: string): SupabaseClient | null {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }

  if (accessToken) {
    return createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  if (!defaultClient) {
    defaultClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return defaultClient;
}
