export const API_BASE = typeof window === "undefined" ? "http://localhost:4000" : "/api/backend";

export async function apiGet(route) {
  const url = `${API_BASE}${route}`;

  let res;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (err) {
    throw new Error(`Network error calling ${url}: ${err.message || err}`);
  }

  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch (err) {
      text = `Failed to read error body: ${err.message || err}`;
    }

    let detail;
    try {
      detail = text ? JSON.parse(text) : null;
    } catch {
      detail = text;
    }

    const message =
      (detail && detail.message) ||
      (typeof detail === "string" ? detail : "") ||
      res.statusText;

    throw new Error(`API error (${res.status}): ${message || "Unknown error"}`);
  }

  return res.json();
}
