"use client";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // choose what you want
  variable: "--font-outfit",
});


export default function VerifyPage() {
  return (
    <div
      className="relative h-[calc(100vh-64px)] w-screen overflow-hidden bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
    >
      <div className={` ${outfit.className} backdrop-blur-xs bg-white/70 border border-white/40 rounded-2xl shadow-xl w-full max-w-4xl flex flex-col md:flex-row items-stretch overflow-hidden`}>
        <div className="flex-1 flex flex-col justify-center px-8 py-12 text-white-300">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow">Email sent!</h1>
          <p className="text-lg drop-shadow">
            Please check the email you signed up with for a verification link. You will not be able to sign in until you verify your email.
          </p>
        </div>
      </div>
    </div>
  );
}
