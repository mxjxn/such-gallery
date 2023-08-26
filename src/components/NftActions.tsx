import { addNftToUser } from "@/app/nfts";
import { useProfile } from "@/hooks/useProfile";
import { Prisma } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { AddToList, CurateWithoutSaving } from "./NftCards";
import { FullNft, FullNftWithListing } from "@/types/types";

export default function NftActions({
  nft,
  onSave,
}: {
  nft: FullNftWithListing;
  onSave: () => void;
}) {
  const queryClient = useQueryClient();
  const { address } = useProfile();
  // add to user nft list
  const { mutate: saveNft } = useMutation({
    mutationFn: () => addNftToUser(address, nft),
    onSuccess: (a: any) => {
      queryClient.invalidateQueries({ queryKey: ["userNfts", address] });
    },
  });
  // save to curated list
  // create curated list and add to it
  return (
    <div className="flex flex-row items-center justify-end gap-8 mt-4 mx-4">
      <button
        className="btn btn-md"
        onClick={() => {
          saveNft();
          onSave();
        }}
      >
        Save
      </button>
      <CurateWithoutSaving nft={nft} />
    </div>
  );
}
