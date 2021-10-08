import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const FILENAME = join(__dirname, "../artifacts/network.json");

export async function mergeNetworkArtifact(data: any) {
  let stored = {};
  try {
    stored = JSON.parse(await readFile(FILENAME, "utf8"));
  } catch (e) {
    if ((e as any).code !== "ENOENT") {
      console.error(e);
      process.exit(1);
    }
  }
  await writeFile(FILENAME, JSON.stringify({ ...stored, ...data }, null, 2));
}
