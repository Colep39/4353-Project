import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from './components/navbar/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "4353 Project",
  description: "COSC 4353 Volunteering Project",
  icons: { icon: '/images/favicon.png'},
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-green-200 min-h-screen`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
