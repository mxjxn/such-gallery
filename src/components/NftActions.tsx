import { addNftToUser } from "@/app/nfts";
import { useProfile } from "@/hooks/useProfile";
import { Prisma } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

export default function NftActions({
  nft,
  onSave,
}: {
  nft: Prisma.NFTCreateInput;
  onSave: () => void;
}) {
  const queryClient = useQueryClient();
  const { address } = useProfile();


  // add to user nft list
  const mutation = useMutation({
    mutationFn: (newNft: any) => { 
			console.log( '🐄 ☘️ 🐮', newNft, "💂‍♀️", address);
			addNftToUser(address, newNft)
		},
    onSuccess: (a: any) => {
      console.log("success adding Nft to User", a);
      queryClient.invalidateQueries({ queryKey: ["userNfts", address] });
    },
  });
  // save to curated list
  // create curated list and add to it
  return (
    <div className="flex flex-row justify-end gap-8 mt-4">
      <button
        className="btn btn-lg"
        onClick={() => {
          mutation.mutate(nft);
          onSave();
        }}
      >
        Save
      </button>
      <button className="btn btn-lg">Curate</button>
    </div>
  );
}
