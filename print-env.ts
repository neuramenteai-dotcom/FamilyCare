import fs from "fs";
import path from "path";

const envStr = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf-8");
console.log(envStr);
