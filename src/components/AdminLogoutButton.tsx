"use client";

import { useState } from "react";

export function AdminLogoutButton() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="min-h-10 border border-white/20 px-4 text-xs font-bold uppercase tracking-normal text-white/85 transition hover:border-white hover:bg-white hover:text-graphite disabled:opacity-60"
    >
      {busy ? "Logout ..." : "Logout"}
    </button>
  );
}
