import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export async function mergeNetworkArtifact(chainId: number, data: any) {
  const filename = join(__dirname, "../artifacts/", `${chainId}.json`);
  let stored = {};
  try {
    stored = JSON.parse(await readFile(filename, "utf8"));
  } catch (e) {
    if ((e as any).code !== "ENOENT") {
      console.error(e);
      process.exit(1);
    }
  }
  await writeFile(filename, JSON.stringify({ ...stored, ...data }, null, 2));
}
