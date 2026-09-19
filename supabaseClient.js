import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// These two values are safe to ship inside the app — the publishable key
// only works within the row-level-security rules set up on the database,
// it is not a secret.
export const SUPABASE_URL = "https://ntopftzqsszwxzlgndef.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_s7_DxCm-0jul1GaIRj5iDA_NoLYOKQ9";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
