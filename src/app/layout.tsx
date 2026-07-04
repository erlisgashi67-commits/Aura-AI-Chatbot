import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AURA — Advanced Universal Reasoning Assistant",
  description:
    "AURA is an elite, agentic AI reasoning assistant operating in Agent Mode. Built for deep reasoning, software engineering, research, and rigorous problem solving.",
  keywords: [
    "AURA",
    "AI assistant",
    "reasoning assistant",
    "Agent Mode",
    "GLM",
    "AI chat",
  ],
  authors: [{ name: "AURA" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AURA — Advanced Universal Reasoning Assistant",
    description:
      "An elite, agentic AI reasoning assistant. Analyze. Plan. Execute. Reflect. Deliver.",
    siteName: "AURA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AURA — Advanced Universal Reasoning Assistant",
    description:
      "An elite, agentic AI reasoning assistant operating in Agent Mode.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
