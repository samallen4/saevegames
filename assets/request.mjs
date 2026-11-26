export const isDeletionCode = (value) => /^[a-f0-9]{64}$/i.test(value);

export async function redeemDeletionCode(endpoint, publishableKey, code, send = fetch) {
  if (!isDeletionCode(code)) return "invalid";
  try {
    const response = await send(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: publishableKey },
      body: JSON.stringify({ code }),
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 404) {
      // The Edge handler replies with an empty object for an unusable code.
      // A platform 404 can mean the deletion function has not been deployed.
      const body = await response.json();
      return body && typeof body === "object" && !Array.isArray(body) && Object.keys(body).length === 0
        ? "not_found" : "unavailable";
    }
    if (response.status === 429) return "rate_limited";
    if (response.status === 200 && (await response.json()).deleted === true) return "deleted";
  } catch {
    return "unavailable";
  }
  return "unavailable";
}
