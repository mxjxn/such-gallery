"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { WagmiConfig, createConfig, mainnet } from "wagmi";
import { createPublicClient, http } from "viem";
import Header from "@/components/Header";
import { ProfileProvider } from "@/hooks/ProfileContext";

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <WagmiConfig config={config}>
          <body className={inter.className}>
            <Header />
            {children}
          </body>
      </WagmiConfig>
    </html>
  );
}
