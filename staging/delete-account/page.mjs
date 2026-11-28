import { endpoint, publishableKey } from "./config.mjs";
import { isDeletionCode, redeemDeletionCode } from "./request.mjs";

const form = document.querySelector("#deletion-form");
const code = document.querySelector("#recovery-code");
const confirmation = document.querySelector("#confirmation");
const submit = document.querySelector("#submit");
const status = document.querySelector("#status");
const configured = /^https:\/\/[a-z0-9]+\.supabase\.co\/functions\/v1\/delete-account$/.test(endpoint)
  && /^sb_publishable_[\w-]+$/.test(publishableKey);
const messages = {
  deleted: "Your Blocksmith online account was deleted.",
  not_found: "That code could not be used. Check it or contact SAEVE Games.",
  rate_limited: "Too many requests. Wait a moment and try again.",
  unavailable: "We could not confirm deletion. Try again or contact SAEVE Games.",
};

if (configured) submit.disabled = false;
else status.textContent = "Online code submission is unavailable. Use the support link below.";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!configured || submit.disabled || !confirmation.checked) return;
  const value = code.value.trim();
  if (!isDeletionCode(value)) {
    status.textContent = "Enter the full 64-character deletion code.";
    code.focus();
    return;
  }
  submit.disabled = true;
  status.textContent = "Submitting your request…";
  const result = await redeemDeletionCode(endpoint, publishableKey, value);
  status.textContent = messages[result];
  if (result === "deleted") {
    form.reset();
    form.hidden = true;
  } else {
    submit.disabled = false;
  }
});
