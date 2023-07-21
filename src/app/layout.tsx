"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { WagmiConfig, createConfig, mainnet } from "wagmi";
import { createPublicClient, http } from "viem";
import Header from "@/components/Header";
import { ProfileProvider } from "@/hooks/ProfileContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const inter = Inter({ subsets: ["latin"] });

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		}
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
        <QueryClientProvider client={queryClient}>
          <body className={inter.className}>
            <Header />
            {children}
          </body>
        </QueryClientProvider>
      </WagmiConfig>
    </html>
  );
}
