"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired, getRemainingTime } from "@/lib/auth.js";

export default function AuthProvider({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const publicRoutes = ["/login", "/register", "/aboutUs", "/", "/emailverify", "/callback"]
    if (publicRoutes.includes(window.location.pathname)) return;

    // if missing or expired, log out immediately
    if (!token || isTokenExpired(token)) {
        if(!publicRoutes.includes(window.location.pathname)){
            localStorage.clear();
            router.push("/login");
        }
      return;
    }

    // schedule auto-logout when token expires
    const timeLeft = getRemainingTime(token);
    const timer = setTimeout(() => {
      localStorage.clear();
      router.push("/login");
    }, timeLeft);

    return () => clearTimeout(timer);
  }, [router]);

  return children;
}
