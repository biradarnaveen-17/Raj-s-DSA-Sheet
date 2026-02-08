import { supabase } from "./supabase.js";
import { requireAuth, signOut, qs, showToast } from "./auth.js";

const session = await requireAuth();
if(!session) {}

qs("who").textContent = "Logged in: " + session.user.email;

qs("logout").addEventListener("click", signOut);
qs("logout2").addEventListener("click", signOut);

const userId = session.user.id;

// sidebar avatar
try{
  const { data } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .maybeSingle();

  if(data?.name){
    qs("avatar").textContent = data.name.trim().slice(0,1).toUpperCase();
  }
}catch(err){
  // ignore
}

// =====================================================
// DELETE ACCOUNT (Deletes app data)
// =====================================================
qs("deleteBtn").addEventListener("click", async () => {
  const ok = confirm(
    "Are you sure?\n\nThis will delete your profile + all progress data.\nThis action cannot be undone."
  );

  if(!ok) return;

  // extra confirm
  const ok2 = confirm("Final confirmation: Delete your account data?");
  if(!ok2) return;

  try{
    showToast("Deleting your data...", "");

    // 1) delete progress rows
    const { error: e1 } = await supabase
      .from("progress")
      .delete()
      .eq("user_id", userId);

    if(e1) throw e1;

    // 2) delete profile row
    const { error: e2 } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if(e2) throw e2;

    // 3) sign out
    await supabase.auth.signOut();

    alert("Your account data is deleted. You will be redirected to login.");

    window.location.href = "login.html";
  }catch(err){
    showToast(err.message || "Failed to delete account.", "bad");
  }
});
