import readline from "readline";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export async function mergeNetworkArtifact(chainId: number, data: any) {
  const dirpath = join(__dirname, "../deployments/");
  await mkdir(dirpath, { recursive: true });
  const filename = join(dirpath, `${chainId}.json`);
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function confirm(question: string) {
  return new Promise((resolve) => {
    rl.question(question + " ", (answer) => {
      resolve(answer === "yes");
    });
  });
}
