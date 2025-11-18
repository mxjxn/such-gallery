"use client";
import React, { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAccountModal } from "@rainbow-me/rainbowkit";
// import { useUpdateName, useUpdateBio } from "@/queryhooks";
import { updateName, updateBio } from "@/app/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import EditableText from "@/components/EditableText";

function ProfileLogin() {
  const {
    connect,
    disconnect,
    isConnected,
    address,
    ensName,
    displayName,
    user,
    signMessage,
  } = useProfile();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const modalRef = React.useRef<HTMLDialogElement | null>(null);

  const { openAccountModal } = useAccountModal();

  const queryClient = useQueryClient();
  const { mutate: updateNameMutation } = useMutation({
    mutationFn: (name: string) => updateName(address, name),
    onSuccess: () => {
      setIsEditingName(false);
      queryClient.invalidateQueries(["userProfile", address]);
    },
  });
  const { mutate: updateBioMutation } = useMutation({
    mutationFn: (bio: string) => updateBio(address, bio),
    onSuccess: () => {
      setIsEditingBio(false);
      queryClient.invalidateQueries(["userProfile", address]);
    },
  });

  const updateNameHandler = async (s: string) => {
    updateNameMutation(s);
  };
  const updateBioHandler = async (s: string) => {
    updateBioMutation(s);
  };

  return (
    <div className="p-1 flex items-center flex-row-reverse">
      {isConnected ? (
        <div>
          <dialog id="my_modal_2" className="modal " ref={modalRef}>
            <form method="dialog" className="modal-box border-8 border-sky-800">
              <p className="pl-0 p-2 mb-2 bg-green-100 text-green-800 rounded-xl tracking-widest text-center">
                Connected with {ensName ?? displayName}
              </p>
              {user?.name && (
                <div className="m-0 py-2">
                  <EditableText
                    label="Display Name"
                    updateHandler={updateNameHandler}
                    initialValue={user?.name}
                  />
                </div>
              )}
              {user?.bio && (
                <div className="m-0 py-2">
                  <EditableText
                    label="Short Bio"
                    updateHandler={updateBioHandler}
                    initialValue={user?.bio}
                  />
                </div>
              )}
              <p className="text-center mt-5">
                <button
                  className="btn"
                  onClick={() => {
                    signMessage();
                  }}
                >
                  Sign
                </button>
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
          <button
            className="uppercase text-sm text-neutral-200 hover:text-neutral-50 p-2 inline-block m-1"
            onClick={() => modalRef.current!.showModal()}
          >
            <div className="text-xs">view/edit profile</div>
          </button>
          <button
            onClick={openAccountModal}
            className="border uppercase text-sm text-neutral-200 hover:text-neutral-50 border-sky-300 rounded-full p-2 inline-block bg-gradient-to-r from-sky-800 to-sky-950 m-1"
          >
            {ensName ?? displayName}
          </button>
        </div>
      ) : (
        <button
          className="border uppercase text-sm text-neutral-200 hover:text-neutral-50 border-rose-300 rounded-md p-2 inline-block bg-gradient-to-r from-rose-800 to-rose-950"
          onClick={() => connect()}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default ProfileLogin;
