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

interface UseProfileReturn {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
	address: string;
  ensName: any; // replace with actual type
  displayName: string | null;
  user: any;
  signMessage: any; // replace with actual type
	updateProfile: Promise<any>;
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
  const [user, setUser] = useState<any>({});
  const userAddress = user?.ethAddress;
  const userEnsName = user?.ensName;
  const ensName = useEnsName({ address });
  const ensData = ensName.data;
  const {
    data: signData,
    isError,
    isLoading,
    isSuccess,
    signMessage,
  } = useSignMessage({
    message: `Such sign. Very ${address}. Wow!`,
  });

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
  }, [isConnected, address, ensData, userAddress, userEnsName]);

	//	const updatedUser = await updateNameAndBio(address, nameValue, bioValue);
  //useEffect(() => {
  //}, [ensData]);

  return {
    connect,
    disconnect,
    isConnected,
		address: userAddress,
    ensName,
    displayName: address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : null,
    user,
		updateProfile: (address: string, name: string, bio: string) => {},
    signMessage,
    signData,
    isError,
    isLoading,
    isSuccess,
  };
}
