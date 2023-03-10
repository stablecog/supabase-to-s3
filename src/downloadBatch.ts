import {
  downloadBatchSize,
  downloadDir,
  maxFetchDuration,
  supabaseBucket,
  supabaseTable,
  supabaseTableSelectLimit,
} from "./constants";
import { createClient } from "@supabase/supabase-js";
import { promiseWithTimeout, toBuffer } from "./helpers";
import fs from "fs";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ADMIN_KEY as string
);

export async function downloadBatch(start_timestamp: string) {
  const start = Date.now();
  let lastTimestamp: string | undefined = undefined;
  let hasMore = true;
  let downloadedCount = 0;
  try {
    const { data, error } = await supabaseAdmin
      .from(supabaseTable)
      .select("image_object_name,created_at,user_id")
      .not("image_object_name", "is", null)
      .not("user_id", "is", null)
      .order("created_at", { ascending: true })
      .gt("created_at", start_timestamp)
      .limit(supabaseTableSelectLimit);
    if (error || !data) {
      console.log(error);
      throw new Error("Error fetching data from table");
    }
    if (data.length === 0) {
      hasMore = false;
      return {
        hasError: false,
        hasMore,
      };
    }
    let i = 0;
    console.log("Total for batch:", data.length);
    while (i < data.length) {
      let paths = [];
      let finalPaths: string[] = [];
      const toAdd = Math.min(downloadBatchSize, data.length - i);
      for (let j = i; j < i + toAdd; j++) {
        const path = `${data[j].user_id}/${data[j].image_object_name}`;
        paths.push(path);
        finalPaths.push(`${downloadDir}/${data[j].image_object_name}`);
      }
      let promises = paths.map((p) =>
        promiseWithTimeout(
          supabaseAdmin.storage.from(supabaseBucket).download(p),
          maxFetchDuration
        )
      );
      try {
        const results = await Promise.all(promises);
        console.log("Downloaded:", paths);
        // Write to file
        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          if (result.error) {
            console.log(result.error);
            return {
              hasError: true,
              lastTimestamp,
              hasMore,
            };
          }
          const buffer = toBuffer(await result.data.arrayBuffer());
          fs.writeFileSync(finalPaths[j], buffer);
          downloadedCount++;
        }
        i += toAdd;
      } catch (error) {
        console.log(error);
        return {
          hasError: true,
          lastTimestamp,
          hasMore,
        };
      }
    }
    lastTimestamp = data[data.length - 1].created_at;
  } catch (error) {
    return {
      hasError: true,
      lastTimestamp,
      hasMore,
    };
  }
  const end = Date.now();
  console.log(
    `Batch complete - Downloaded ${downloadedCount} files in ${Math.round(
      (end - start) / 1000
    )} seconds`
  );
  return {
    hasError: false,
    hasMore,
    lastTimestamp,
  };
}
