"use client";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../authHelper";
import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() =>{
    const handleCallback = async () => {
      const hash = window.location.hash.substring(1);

      const params = new URLSearchParams(hash);

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (!access_token || !refresh_token){
        console.error("no tokens in url")
        return;
      }
      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      let userRole = null;
      try {
        const res = await fetchWithAuth(`${API_URL}/api/auth/role`);
        const data = await res.json();

        userRole = data.role;
      } catch (e) {
        console.error(e);
      }
      

      if (!userRole) {
        console.error("no role returned");
        return;
      }

      localStorage.setItem("role", userRole);

      window.history.replaceState({}, "", "/callback");

      window.location.href = "/profile";
    }

    handleCallback();

  }, [router])


  return <p>Finishing login…</p>;
}
