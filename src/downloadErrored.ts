import dotenv from "dotenv";
import {
  addToErroredTimestamps,
  addToErroredTimestampsSecondPass,
  createDirs,
  getErroredTimestamps,
  getLastSuccessfulTimestamp,
  saveLastTimestamp,
} from "./helpers";
import { downloadBatch } from "./downloadBatch";

dotenv.config();

async function main() {
  createDirs();
  const start = Date.now();
  let erroredTimestamps = getErroredTimestamps();
  for (let i = 0; i < erroredTimestamps.length; i++) {
    const timestamp = erroredTimestamps[i];
    let hasError = true;
    while (hasError) {
      const { hasTableError } = await downloadBatch(timestamp);
      if (hasTableError) {
        addToErroredTimestampsSecondPass(timestamp);
        console.log("Error downloading batch, retrying in 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      } else {
        hasError = false;
      }
    }
  }
  const end = Date.now();
  console.log(`Total time: ${Math.round((end - start) / 1000 / 60)} minutes`);
}

main();
