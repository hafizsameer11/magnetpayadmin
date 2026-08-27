import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/routes");
let bad = [];
for (const f of fs.readdirSync(dir).filter((x) => x.startsWith("admin") && x.endsWith(".tsx"))) {
  const src = fs.readFileSync(path.join(dir, f), "utf8");
  const m = src.match(/createFileRoute\("([^"]+)"\)/);
  if (!m) {
    bad.push(f + ": no route");
    continue;
  }
  let s = f.replace(/^admin\./, "").replace(/\.tsx$/, "");
  const parts = s.split(".");
  if (parts[parts.length - 1] === "index") parts.pop();
  let exp = "/admin/" + parts.join("/");
  const got = m[1];
  const ok = got === exp || got === exp + "/" || got + "/" === exp;
  if (!ok) bad.push(`${f} got=${got} exp=${exp}`);
}
console.log("mismatches", bad.length);
bad.slice(0, 40).forEach((x) => console.log(x));
