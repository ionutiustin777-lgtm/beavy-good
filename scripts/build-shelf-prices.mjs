#!/usr/bin/env node
import { readFile, mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { buildShelfSnapshot } from "../src/shelf-prices.mjs";

const [inputPath, outputPath = "public/data/shelf-prices.json"] = process.argv.slice(2);

if (!inputPath || inputPath === "--help" || inputPath === "-h") {
  console.error("Usage: node scripts/build-shelf-prices.mjs <offers-input.json> [output.json]");
  console.error("Input: JSON array of validated offers or an object { generatedAt?, maxAgeDays?, sources?, offers: [] }.");
  process.exit(inputPath ? 0 : 2);
}

try {
  const parsed = JSON.parse(await readFile(resolve(inputPath), "utf8"));
  const input = Array.isArray(parsed) ? { offers: parsed } : parsed;
  const snapshot = buildShelfSnapshot(input);
  const destination = resolve(outputPath);
  await mkdir(dirname(destination), { recursive: true });
  const temporary = `${destination}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  await rename(temporary, destination);
  console.log(`Saved ${snapshot.offers.length} offers to ${destination}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
