"use client";
import React, { useEffect } from "react";
import _ from "lodash";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNftsByUser,
  removeNftFromUser,
} from "@/app/nfts";
import Image from "next/image";
import { NftCard, NftListItem } from "./NftCards";
import { addNftToCuratedList } from "@/app/curated";
import { FullNftWithListing } from "@/types/types";
import {NFT} from "@prisma/client";

export default function UserNftList({ address }: { address: string }) {
  const queryClient = useQueryClient();
  const { data } = useQuery<NFT[]>(["userNfts", address], async () =>
    getNftsByUser(address)
  );
  const { mutate: deleteNft } = useMutation({
    mutationFn: ({
      ethAddress,
      nftId
    }: {
      ethAddress: string;
      nftId: number;
    }) => {
      return removeNftFromUser(ethAddress, nftId);
    },
    onSuccess: (a: any) => {
      queryClient.invalidateQueries({ queryKey: ["userNfts", address] });
    },
  });
  const { mutate: addNftToList } = useMutation({
    mutationFn: ({ nftId, listId }: { nftId: number; listId: number }) => {
      return addNftToCuratedList(nftId, listId);
    },
		onSuccess: (a: any) => {
			queryClient.invalidateQueries({ queryKey: ["userCuratedLists", address] });
		}
  });
  const [cardView, setCardView] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(-1);

  return (
    <div>
      {!_.isEmpty(data) && (
        <div className="animate-fadeIn w-full bg-gradient-to-b to-gray-900 from-gray-800 text-gray-100 border border-slate-700 my-8 rounded-2xl px-4">
          <div className="w-full pb-0 flex flex-row items-center flex-row justify-between justify-items-start">
            <p className="pl-2 text-2xl text-center">Saved NFTs</p>
            <div className="cursor-pointer label inline-block py-2 flex items-center">
              <span className="label-text px-5">
                List
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                onChange={(e) => {
                  if (e.target.checked) {
                    setCardView(true);
                  } else {
                    setCardView(false);
                  }
                }}
              />

              <span className="label-text p-5">
                Cards
              </span>
            </div>
          </div>
          <div className=" rounded-2xl border-4 border-slate-800 mb-4">
            {!cardView ? (
              <div className="w-full flex flex-col justify-stretch flex-wrap gap-1 items-stretch p-2">
                {!!data &&
                  data.map((nft, i) => (
                    <NftListItem
                      key={`${nft?.title}_${Math.floor(
                        Math.random() * Math.pow(2, 11)
                      )}`}
											nft={nft}
                      imageURI={nft?.imageURI || ""}
                      title={nft?.title || "Missing title"}
                      onClose={() => {
                        setActiveItem(-1);
                      }}
                      onSelect={() => {
                        if (activeItem !== i) {
                          setActiveItem(i);
                        }
                      }}
                      isOpen={i === activeItem}
                      onAddToList={(listId) => {
												addNftToList({ nftId: nft.id, listId });
                      }}
                      onDelete={async () =>
                        deleteNft({
                          ethAddress: address,
                          nftId: nft.id,
                        })
                      }
                    />
                  ))}
              </div>
            ) : (
              <div className="w-full flex flex-row justify-around flex-wrap items-stretch">
                {!_.isEmpty(data) && _.isArray(data) &&
                  data.map((nft) => (
                    <NftCard
                      key={`${nft?.title}_${Math.floor(
                        Math.random() * Math.pow(2, 11)
                      )}`}
                      imageURI={nft?.imageURI || ""}
                      title={nft?.title || "Missing title"}
                      size="sm"
                      onDelete={async () =>
                        deleteNft({
                          ethAddress: address,
                          nftId: nft.id,
                        })
                      }
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
