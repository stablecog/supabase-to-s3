import { supabaseAdmin, supabaseTable } from "./constants";

async function main() {
  const { count } = await supabaseAdmin
    .from(supabaseTable)
    .select("*", { count: "exact", head: true })
    .not("image_object_name", "is", null)
    .not("user_id", "is", null);
  console.log("Count is:", count);
}

main();
