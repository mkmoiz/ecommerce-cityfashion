import { API_BASE } from "./api";

function resolveToken(explicitToken) {
  if (explicitToken) return explicitToken;
  if (typeof window !== "undefined") {
    const localToken = window.localStorage.getItem("admin_token");
    if (localToken) return localToken;
  }
  return "";
}

function buildHeaders(token, extra = {}) {
  const headers = { ...extra };
  const resolved = resolveToken(token);
  if (resolved) {
    headers.Authorization = `Bearer ${resolved}`;
  }
  headers["Content-Type"] = headers["Content-Type"] || "application/json";
  return headers;
}

async function request(method, route, body, token) {
  const url = `${API_BASE}${route}`;
  const options = {
    method,
    headers: buildHeaders(token),
    credentials: "include"
  };

  if (body !== undefined) {
    options.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, { ...options, cache: "no-store" });
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

    throw new Error(`Admin API error (${res.status}): ${message || "Unknown error"}`);
  }

  if (res.status === 204) return null;

  return res.json();
}

export function getAdminToken() {
  return resolveToken();
}

export async function adminGet(route, token) {
  return request("GET", route, undefined, token);
}

export async function adminPost(route, body, token) {
  return request("POST", route, body, token);
}

export async function adminPut(route, body, token) {
  return request("PUT", route, body, token);
}

export async function adminDelete(route, token) {
  return request("DELETE", route, undefined, token);
}

export async function uploadProductImage(file, token) {
  const resolved = resolveToken(token);
  if (!resolved) {
    throw new Error("Sign in as admin to upload images.");
  }

  const signed = await adminPost("/upload/image", { fileType: file.type }, resolved);

  const uploadRes = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(text || "Failed to upload image");
  }

  return signed.imageUrl;
}
