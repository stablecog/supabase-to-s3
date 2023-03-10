import {
  downloadDir,
  erroredTimestampsFile,
  erroredTimestampsSecondPassFile,
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

  // Create the errored timestamps second pass file if it doesn't exist
  if (!fs.existsSync(`${outputDir}/${erroredTimestampsSecondPassFile}`)) {
    fs.writeFileSync(`${outputDir}/${erroredTimestampsSecondPassFile}`, "");
  }
}

export const addToErroredTimestamps = (timestamp: string) => {
  fs.appendFileSync(`${outputDir}/${erroredTimestampsFile}`, `${timestamp},`);
};

export const addToErroredTimestampsSecondPass = (timestamp: string) => {
  fs.appendFileSync(
    `${outputDir}/${erroredTimestampsSecondPassFile}`,
    `${timestamp},`
  );
};

export const saveLastTimestamp = (timestamp: string) => {
  fs.writeFileSync(`${outputDir}/${timestampFile}`, `${timestamp}`);
};

export const getLastSuccessfulTimestamp = () => {
  return fs.readFileSync(`${outputDir}/${timestampFile}`, "utf8");
};

export const getErroredTimestamps = () => {
  const erroredTimestampsString = fs.readFileSync(
    `${outputDir}/${erroredTimestampsFile}`,
    "utf8"
  );
  if (erroredTimestampsString) {
    return erroredTimestampsString.split(",");
  }
  return [];
};

export function toBuffer(arrayBuffer: ArrayBuffer) {
  const buffer = Buffer.alloc(arrayBuffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

export const promiseWithTimeout = <T>(prom: Promise<T>, time: number) =>
  Promise.race([prom, new Promise<T>((_r, rej) => setTimeout(rej, time))]);
