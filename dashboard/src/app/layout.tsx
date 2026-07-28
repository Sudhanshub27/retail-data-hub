import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardContainer from "@/components/DashboardContainer";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Retail Data Hub — Dashboard",
    description:
        "Smart Retail Supply Chain & Customer Intelligence Platform — Analytics Dashboard",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`min-h-screen bg-slate-100/70 ${inter.variable} font-sans selection:bg-indigo-500/20 selection:text-indigo-600`}>
                <ToastProvider>
                    <DashboardContainer>
                        {children}
                    </DashboardContainer>
                </ToastProvider>
            </body>
        </html>
    );
}
