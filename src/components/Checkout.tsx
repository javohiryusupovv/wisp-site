"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

export type Product = "mac" | "windows";

const names: Record<Product, string> = { mac: "Wisp for Mac", windows: "Wisp for Windows" };
const GITHUB_USER = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/** Lemon Squeezy checkout URL with the buyer's GitHub username attached as custom data. */
function checkoutUrl(product: Product, github: string) {
  const base = site.checkout[product];
  const url = new URL(base, window.location.href);
  url.searchParams.set("checkout[custom][github]", github);
  return url.toString();
}

type Status = { kind: "idle" } | { kind: "checking" } | { kind: "error"; message: string };

/**
 * Asks for the buyer's GitHub username before checkout, checks that the account exists,
 * then sends them to Lemon Squeezy. After payment the webhook invites that account to the private repo.
 */
export function CheckoutDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (product && !d.open) d.showModal();
    if (!product && d.open) d.close();
  }, [product]);

  const close = () => {
    setStatus({ kind: "idle" });
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const user = name.trim().replace(/^@/, "");
    if (!GITHUB_USER.test(user)) {
      setStatus({ kind: "error", message: "That doesn't look like a GitHub username. Use the name from your profile URL, github.com/username." });
      return;
    }
    setStatus({ kind: "checking" });
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, { headers: { Accept: "application/vnd.github+json" } });
      if (res.status === 404) {
        setStatus({ kind: "error", message: `No GitHub account called "${user}". Check the spelling, or create a free account first.` });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const account: { login?: string; type?: string } = await res.json();
      if (account.type && account.type !== "User") {
        setStatus({ kind: "error", message: `"${user}" is an organisation. Enter your personal GitHub username.` });
        return;
      }
      window.location.href = checkoutUrl(product, account.login ?? user);
    } catch {
      // GitHub unreachable or rate-limited: the format is valid, so continue rather than block the sale
      window.location.href = checkoutUrl(product, user);
    }
  };

  return (
    <dialog ref={dialog} className="checkout" onClose={close} onClick={(e) => e.target === dialog.current && close()} aria-labelledby="checkout-title">
      <form onSubmit={submit}>
        <button type="button" className="x" onClick={close} aria-label="Close">×</button>
        <h3 id="checkout-title">Get {product ? names[product] : "Wisp"}</h3>
        <p>
          Wisp is delivered through a private GitHub repository. Right after you pay, GitHub emails you an invite. Accept
          it to download the app and get every update.
        </p>
        <label htmlFor="gh">Your GitHub username</label>
        <div className="field">
          <span>github.com/</span>
          <input
            id="gh"
            value={name}
            onChange={(e) => { setName(e.target.value); if (status.kind === "error") setStatus({ kind: "idle" }); }}
            placeholder="username"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            required
            autoFocus
          />
        </div>
        {status.kind === "error" && <p className="err" role="alert">{status.message}</p>}
        <button type="submit" className="btn btn-primary" disabled={status.kind === "checking"}>
          {status.kind === "checking" ? "Checking…" : "Continue to payment"}
        </button>
        <p className="small">
          No GitHub account? <a href="https://github.com/signup" target="_blank" rel="noreferrer">Create one for free</a>, then
          come back.
        </p>
      </form>
    </dialog>
  );
}
