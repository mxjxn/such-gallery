"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsName,
  useSignMessage,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UseProfileReturn {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  ensName: any; // replace with actual type
  displayName: string | null;
  user: any;
  signMessage: any; // replace with actual type
  signData: any; // replace with actual type
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
}

export function useProfile(): UseProfileReturn {
  // wallet state hooks
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const ensName = useEnsName({ address });
  const {
    data: signData,
    isError,
    isLoading,
    isSuccess,
    signMessage,
  } = useSignMessage({
    message: `Such sign. Very ${address}. Wow!`,
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isConnected) {
      // Fetch the user from the database
      const fetchUser = async () => {
        let user;
        try {
          user = await prisma.user.findUnique({
            where: { ethAddress: address },
          });

          // If the user doesn't exist, create a new one
          if (!user && address) {
            user = await prisma.user.create({
              data: {
                ethAddress: address,
                // Add other fields as necessary
              },
            });
          }
        } catch (error) {
          console.error("Error fetching or creating user:", error);
        }

        // Update the user state
        setUser(user);
      };

      fetchUser();
    }
  }, [isConnected, address]);

  useEffect(() => {
    // console.log({signData, isError, isLoading, isSuccess});
  }, [signData, isError, isLoading, isSuccess]);

  return {
    connect,
    disconnect,
    isConnected,
    ensName,
    displayName: address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : null,
    user,
    signMessage,
    signData,
    isError,
    isLoading,
    isSuccess,
  };
}
