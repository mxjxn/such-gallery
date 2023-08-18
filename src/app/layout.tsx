"use client";

import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, optimism, zora } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { inter } from "@/fonts";
import { createPublicClient, http } from "viem";
import Header from "@/components/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const { chains, publicClient } = configureChains(
  [mainnet, optimism, zora],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID || "" }), publicProvider()]
);
const { connectors } = getDefaultWallets({
  appName: "Such Gallery",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains,
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={[mainnet]}>
          <QueryClientProvider client={queryClient}>
            <body className={inter.className}>
              <Header />
              {children}
            </body>
          </QueryClientProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </html>
  );
}
