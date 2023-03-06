import dotenv from "dotenv";
import {
  addToErroredTimestamps,
  createDirs,
  getLastSuccessfulTimestamp,
  saveLastTimestamp,
} from "./helpers";
import { downloadBatch } from "./downloadBatch";

dotenv.config();

async function main() {
  createDirs();
  let hasMoreToDownload = true;
  let timestamp = "1975-01-01T00:00:00.000000+00:00";
  let lastTimestamp = getLastSuccessfulTimestamp();
  if (lastTimestamp) {
    timestamp = lastTimestamp;
  }
  const start = Date.now();
  while (hasMoreToDownload) {
    const { hasError, lastTimestamp, hasMore } = await downloadBatch(timestamp);
    hasMoreToDownload = hasMore;
    if (hasError) {
      addToErroredTimestamps(timestamp);
      console.log("Error downloading batch, retrying in 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      continue;
    }
    if (lastTimestamp) {
      timestamp = lastTimestamp;
      saveLastTimestamp(timestamp);
    }
  }
  const end = Date.now();
  console.log(`Total time: ${Math.round((end - start) / 1000 / 60)} minutes`);
}

main();
