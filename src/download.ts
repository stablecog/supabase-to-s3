import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { addToErroredObjects, createDirs, toBuffer } from "./helpers";
import {
  downloadBatchSize,
  downloadDir,
  supabaseBucket,
  supabaseTable,
  supabaseTableSelectLimit,
} from "./constants";
// @ts-ignore

dotenv.config();

createDirs();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ADMIN_KEY as string
);

async function main() {
  const start = Date.now();
  const { data, error } = await supabaseAdmin
    .from(supabaseTable)
    .select("image_object_name,created_at,user_id")
    .not("image_object_name", "is", null)
    .not("user_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(supabaseTableSelectLimit);
  if (error || !data) {
    console.log(error);
    return;
  }
  let i = 0;
  console.log("Total:", data.length);
  let downloadedCount = 0;
  let downloadErrorCount = 0;
  while (i < data.length) {
    let promises = [];
    let paths = [];
    let finalPaths: string[] = [];
    const toAdd = Math.min(downloadBatchSize, data.length - i);
    for (let j = i; j < i + toAdd; j++) {
      const path = `${data[j].user_id}/${data[j].image_object_name}`;
      paths.push(path);
      finalPaths.push(`${downloadDir}/${data[j].image_object_name}`);
      promises.push(supabaseAdmin.storage.from(supabaseBucket).download(path));
    }
    const results = await Promise.all(promises);
    console.log("Downloaded:", paths);
    // Write to file
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.error) {
        console.log(result.error);
        downloadErrorCount++;
        addToErroredObjects(paths[j]);
        continue;
      }
      if (Math.random() < 0.2) {
        downloadErrorCount++;
        addToErroredObjects(paths[j]);
        continue;
      }
      const buffer = toBuffer(await result.data.arrayBuffer());
      fs.writeFileSync(finalPaths[j], buffer);
      downloadedCount++;
    }
    i += toAdd;
  }
  const end = Date.now();
  console.log(
    `Downloaded ${downloadedCount} files in ${Math.round(
      (end - start) / 1000
    )} seconds - ${downloadErrorCount} errors`
  );
}

main();
