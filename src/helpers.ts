import {
  downloadDir,
  erroredTimestampsFile,
  outputDir,
  timestampFile,
} from "./constants";
import fs from "fs";

export function createDirs() {
  // Create the dir if it doesn't exist
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
  }

  // Create output dir if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Create the timestamp file if it doesn't exist
  if (!fs.existsSync(`${outputDir}/${timestampFile}`)) {
    fs.writeFileSync(`${outputDir}/${timestampFile}`, "");
  }

  // Create the errored timestamps file if it doesn't exist
  if (!fs.existsSync(`${outputDir}/${erroredTimestampsFile}`)) {
    fs.writeFileSync(`${outputDir}/${erroredTimestampsFile}`, "");
  }
}

export const addToErroredTimestamps = (timestamp: string) => {
  fs.appendFileSync(`${outputDir}/${erroredTimestampsFile}`, `${timestamp},`);
};

export const saveLastTimestamp = (timestamp: string) => {
  fs.writeFileSync(`${outputDir}/${timestampFile}`, `${timestamp}`);
};

export const getLastSuccessfulTimestamp = () => {
  return fs.readFileSync(`${outputDir}/${timestampFile}`, "utf8");
};

export function toBuffer(arrayBuffer: ArrayBuffer) {
  const buffer = Buffer.alloc(arrayBuffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}
