import { createClient } from "@supabase/supabase-js";

// Use the PUBLIC_ prefix for client-side access
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      // The PKCE flow is a great choice for client-side auth!
      flowType: "pkce",
    },
  }
);
