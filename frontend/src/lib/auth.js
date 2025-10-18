// lib/auth.js
import {jwtDecode} from "jwt-decode";

export function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch {
    return true;
  }
}

export function getRemainingTime(token) {
  const decoded = jwtDecode(token);
  return decoded.exp * 1000 - Date.now();
}
