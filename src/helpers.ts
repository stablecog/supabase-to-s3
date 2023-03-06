import {
  downloadDir,
  erroredObjectsFile,
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

  // Create the errored objects file if it doesn't exist
  if (!fs.existsSync(`${outputDir}/${erroredObjectsFile}`)) {
    fs.writeFileSync(`${outputDir}/${erroredObjectsFile}`, "");
  }
}

export const addToErroredObjects = (objectName: string) => {
  fs.appendFileSync(`${outputDir}/${erroredObjectsFile}`, `${objectName},`);
};

export function toBuffer(arrayBuffer: ArrayBuffer) {
  const buffer = Buffer.alloc(arrayBuffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}
