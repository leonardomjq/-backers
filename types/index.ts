export interface Creator {
  id: string;
  twitter_handle: string;
  token_mint: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bags_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  creator_id: string;
  champion_wallet: string;
  status: "active" | "completed" | "cancelled";
  amount_sol: number;
  created_at: string;
}

// Stub for Supabase generated types — replace with `supabase gen types typescript`
export type Database = {
  public: {
    Tables: {
      creators: {
        Row: Creator;
        Insert: Omit<Creator, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Creator, "id" | "created_at" | "updated_at">>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, "id" | "created_at">;
        Update: Partial<Omit<Campaign, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
