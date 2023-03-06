import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ADMIN_KEY as string
);
export const supabaseTable = "generation";
export const supabaseTableSelectLimit = 1000;
export const downloadBatchSize = 100;
export const supabaseBucket = "generation";
export const downloadDir = "downloads";
export const outputDir = "outputs";
export const timestampFile = "last_successful_timestamp.txt";
export const erroredTimestampsFile = "errored_timestamps.txt";
export const maxFetchDuration = 5000;
