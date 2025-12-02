// No-op admin auth provider to keep tree stable. Admin auth now uses HttpOnly cookie set by backend.
export function AdminAuthProvider({ children }) {
  return children;
}
export function useAdminAuth() {
  return { token: null, saveToken: () => {}, clearToken: () => {} };
}
