import { Tables } from "@/integrations/supabase/types";

export type Bill = Tables<"Bills">;
export type Person = Tables<"People">;
export type Sponsor = Tables<"Sponsors">;
export type History = Tables<"History">;
export type Rollcall = Tables<"Rollcalls">;
export type Vote = Tables<"Votes">;

export interface BillWithSponsor extends Bill {
  primary_sponsor?: Person;
}

export interface SponsorWithPerson extends Sponsor {
  person: Person;
}

export interface VoteWithPerson extends Vote {
  person: Person;
}