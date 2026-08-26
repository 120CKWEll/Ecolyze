"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseClient = getSupabaseClient;
const supabase_js_1 = require("@supabase/supabase-js");
const env_js_1 = require("./env.js");
let defaultClient = null;
function getSupabaseClient(accessToken) {
    if (!env_js_1.config.supabaseUrl || !env_js_1.config.supabaseAnonKey) {
        return null;
    }
    if (accessToken) {
        return (0, supabase_js_1.createClient)(env_js_1.config.supabaseUrl, env_js_1.config.supabaseAnonKey, {
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
        defaultClient = (0, supabase_js_1.createClient)(env_js_1.config.supabaseUrl, env_js_1.config.supabaseAnonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
    }
    return defaultClient;
}
