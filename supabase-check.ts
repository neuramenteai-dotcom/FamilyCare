import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envStr = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf-8");
const env: Record<string, string> = {};
envStr.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  env.VITE_SUPABASE_URL || "",
  env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function check() {
  const { data, error } = await supabase.from("waitlist").select("*").limit(1);
  console.log("Waitlist columns:", data && data.length > 0 ? Object.keys(data[0]) : (error || "No data"));
}
check();
