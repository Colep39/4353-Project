import { jwtDecode } from "jwt-decode";

export function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try{
        const decoded = jwtDecode(token);
        return decoded.sub;
    } catch(err){
        console.error("Invalid token", err);
        return null;
    }
}

export async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refresh_token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
    };

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 && refreshToken) {
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
            const newTokens = await refreshRes.json();
            localStorage.setItem("token", newTokens.token);
            localStorage.setItem("refresh_token", newTokens.refresh_token);

            const retryHeaders = {
                ...headers,
                Authorization: `Bearer ${newTokens.token}`,
            };
            return fetch(url, { ...options, headers: retryHeaders });
        } else {
            localStorage.clear();
            window.location.href = "/login";
        }
    }

    return res;
}