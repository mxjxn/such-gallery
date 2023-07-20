"use client";
import React, { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { updateName, updateBio } from "@/app/users";

function Profile() {
  const {
    connect,
    disconnect,
    isConnected,
    address,
    ensName,
    displayName,
    user,
    signMessage,
    updateProfile,
    signData,
    isError,
    isLoading,
    isSuccess,
  } = useProfile();

  useEffect(() => {
    if (user?.name !== nameValue) {
      setNameValue(user.name);
    }
    if (user?.bio !== bioValue) {
      setBioValue(user.bio);
    }
  }, [user]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [bioValue, setBioValue] = useState("");

  const updateNameHandler = async (e: any) => {
    e.stopPropagation();
    const updatedProfile = await updateName(address, nameValue);
    setIsEditingName(false);
    const name = updatedProfile?.name;
    setNameValue(name || "");
  };
  const updateBioHandler = async (e: any) => {
    e.stopPropagation();
    const updatedProfile = await updateBio(address, bioValue);
    setIsEditingBio(false);
    const bio = updatedProfile?.bio;
    setBioValue(bio || "");
  };

  const getNameValue = () => nameValue;
  return (
    <div className="m-2">
      {isConnected ? (
        <div>
          <dialog id="my_modal_2" className="modal">
            <form method="dialog" className="modal-box">
              <p className="pl-0 p-2 bg-sky-950 rounded-xl tracking-widest text-center">
                Connected with {ensName?.data ?? displayName}
              </p>

              {isEditingName ? (
                <div className="py-2 m-0">
                  <input
                    className="input input-bordered w-full max-w-xs text-white bg-slate-900"
                    placeholder={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                  />
                  <div
                    className="text-white bg-red-500 inline-block p-2 m-1 rounded-lg cursor-pointer hover:border-red-200 border border-red-500 active:bg-red-400 transition-colors"
                    onClick={() => setIsEditingName(false)}
                  >
                    Cancel
                  </div>
                  <div
                    className="text-white bg-green-500 inline-block p-2 m-1 rounded-lg cursor-pointer hover:border-green-100 border border-green-500 transition-colors active:bg-green-400"
                    onClick={updateNameHandler}
                  >
                    Save
                  </div>
                </div>
              ) : (
                <div className="p-2 m-0 flex items-center" onClick={() => setIsEditingName(true)}>
                  <span className="text-slate-400 text-sm pr-2 underline block w-14">
                    Name
                  </span>
                  {nameValue}
                </div>
              )}
              {isEditingBio ? (
                <div className="m-0 py-2">
                  <input
                    className="input input-bordered w-full max-w-xs text-white bg-slate-900"
                    placeholder={bioValue}
                    onChange={(e) => setBioValue(e.target.value)}
                  />
                  <button
                    className="text-white bg-red-500 inline-block p-2 m-1 rounded-lg cursor-pointer hover:border-red-200 border border-red-500 active:bg-red-400 transition-colors"
                    onClick={(e) => {
                      setIsEditingBio(false);
                    }}
                  >
                    Cancel
                  </button>
                  <div
                    className="text-white bg-green-500 inline-block p-2 m-1 rounded-lg cursor-pointer hover:border-green-100 border border-green-500 transition-colors active:bg-green-400"
                    onClick={updateBioHandler}
                  >
                    Save
                  </div>
                </div>
              ) : (
                <p className="p-2 m-0 flex items-center" onClick={() => setIsEditingBio(true)}>
                  <span className="text-slate-400 text-sm pr-2 underline w-14">
                    Bio
                  </span>
                  {bioValue}
                </p>
              )}
              {/*
              {isEditingName && (
                <>
                  <input
                    type="text"
                    placeholder={nameValue}
                    onChange={(e) => {
                      console.log("set name to ", e.target.value);
                      setNameValue(e.target.value);
                    }}
                    className="input input-bordered w-full max-w-xs"
                  />
                </>
              )}
              {!isEditingBio && <p className="m-2">Bio: {user?.bio}</p>}
              {isEditingBio && (
                <>
                  <input
                    type="text"
                    placeholder={bioValue}
                    onChange={(e) => {
                      console.log("set name to ", e.target.value);
                      setNameValue(e.target.value);
                    }}
                    className="input input-bordered w-full max-w-xs"
                  />
                </>
              )}
*/}
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
          <div
            className="border uppercase text-sm text-neutral-200 hover:text-neutral-50 border-sky-300 rounded-md p-2 inline-block bg-gradient-to-r from-sky-800 to-sky-950"
            onClick={() => window.my_modal_2.showModal()}
          >
            Connected to {ensName?.data ?? displayName}
          </div>
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

export default Profile;
