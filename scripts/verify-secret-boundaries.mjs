import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const envPath = path.join(root, ".env.local");
const staticRoot = path.join(root, ".next", "static");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    fs.readFileSync(filePath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(target) : [target];
  });
}

const env = readEnvFile(envPath);
const forbidden = [
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.DATABASE_URL || env.DATABASE_URL,
]
  .filter(Boolean)
  .filter((value) => !String(value).includes("[YOUR-PASSWORD]"));

if (!forbidden.length) {
  console.log("No concrete server secrets available locally for boundary scan.");
  process.exit(0);
}

const files = walkFiles(staticRoot);
const leaks = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  for (const secret of forbidden) {
    if (content.includes(secret)) {
      leaks.push(file);
      break;
    }
  }
}

if (leaks.length) {
  console.error("Secret leak detected in client build:");
  leaks.forEach((file) => console.error(file));
  process.exit(1);
}

console.log("No server secrets found in .next/static.");
