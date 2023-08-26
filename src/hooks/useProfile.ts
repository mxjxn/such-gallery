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

import prisma from "@/prisma";
import { getUser, updateUserEns } from "@/app/users";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface UseProfileReturn {
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
  address: string;
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
  const { connect } = useConnect();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<any>({});
  const userAddress = user?.ethAddress;
  const userEnsName = user?.ensName;
  const { data: ensData, isLoading: isLoadingEns, isError: isEnsError, error: ensError } = useEnsName({ address, chainId: 1 });
  const {
    data: signData,
    isError,
    isLoading,
    isSuccess,
    signMessage,
  } = useSignMessage({
    message: `Such sign. Very ${address}. Wow!`,
  });

  // auto login (only once)
  const [hasAutoLoggedIn, setHasAutoLoggedIn] = useState(false);
  useEffect(() => {
    if (!hasAutoLoggedIn && !address) {
      connect();
      setHasAutoLoggedIn(true);
    }
  }, [connect, address, hasAutoLoggedIn]);

  useEffect(() => {
    if (!userAddress && isConnected && address) {
      // Fetch the user from the database
      const fetchUser = async () => {
        let userFromServer = await getUser(address);
        // Update the user state
        setUser(userFromServer);
      };

      fetchUser();
    } else if (userAddress && ensData && address && userEnsName !== ensData) {
      const updateUser = async () => {
        let updatedUser = await updateUserEns(address, ensData);
        setUser(updatedUser);
      };
      updateUser();
    }
  }, [isConnected, address, ensData, userAddress, userEnsName, isLoadingEns, ensError,isEnsError]);

  return {
    connect: () => !!openConnectModal && openConnectModal(),
    disconnect,
    isConnected,
    address: userAddress,
    ensName: ensData,
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
