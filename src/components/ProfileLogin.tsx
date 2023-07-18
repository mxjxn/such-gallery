"use client";
import React, { useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsName,
  useSignMessage,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import { UseProfileReturn, useProfile } from "@/hooks/useProfile";

function Profile() {
  const {
    connect,
    disconnect,
    isConnected,
    ensName,
    displayName,
    user,
    signMessage,
    signData,
    isError,
    isLoading,
    isSuccess,
  } = useProfile();

  useEffect(() => {
    console.log({
      connect,
      disconnect,
      isConnected,
      ensName,
      displayName,
      user,
      signMessage,
      signData,
      isError,
      isLoading,
      isSuccess,
    });
  }, [
    connect,
    disconnect,
    isConnected,
    ensName,
    displayName,
    user,
    signMessage,
    signData,
    isError,
    isLoading,
    isSuccess,
  ]);
  if (isConnected)
    return (
      <div className="m-2">
        <dialog id="my_modal_2" className="modal">
          <form method="dialog" className="modal-box">
            <p className="pl-0 p-2 bg-sky-950 rounded-xl tracking-widest text-center">
              Connected with {ensName?.data ?? displayName}
            </p>
            <p className="text-center mt-5">
              <button
                className="p-3 bg-gradient-to-b from-rose-800 to-rose-950 border-rose-700 tracking-wider rounded-xl"
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </p>
          </form>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        {/*  */}
        <div
          className="border uppercase text-sm text-neutral-200 hover:text-neutral-50 border-sky-300 rounded-md p-2 inline-block bg-gradient-to-r from-sky-800 to-sky-950"
          onClick={() => window.my_modal_2.showModal()}
        >
          Connected to {ensName?.data ?? displayName}
        </div>
      </div>
    );
  return (
    <div className="m-2">
      <button
        className="border uppercase text-sm text-neutral-200 hover:text-neutral-50 border-rose-300 rounded-md p-2 inline-block bg-gradient-to-r from-rose-800 to-rose-950"
        onClick={() => connect()}
      >
        Connect Wallet
      </button>
    </div>
  );
}

export default Profile;
