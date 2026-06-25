import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envStr = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf-8");
const env: Record<string, string> = {};
envStr.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
});

const supabaseUrl = env["VITE_SUPABASE_URL"];
const supabaseKey = env["SUPABASE_SERVICE_ROLE_KEY"];

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function deleteUser() {
  const email = "finestreonlineitalia@gmail.com";
  console.log(`Deleting ${email}...`);

  // Delete from waitlist
  const { error: waitlistError } = await supabaseAdmin
    .from("waitlist")
    .delete()
    .eq("email", email);
  
  if (waitlistError) {
    console.error("Waitlist error:", waitlistError);
  } else {
    console.log("Deleted from waitlist table.");
  }

  // Find in auth
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (!listError) {
    const user = users.find(u => u.email === email);
    if (user) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (authError) {
        console.error("Auth error:", authError);
      } else {
        console.log("Deleted from Auth.");
      }
    } else {
      console.log("User not found in Auth.");
    }
  }

  console.log("Done.");
}

deleteUser();
