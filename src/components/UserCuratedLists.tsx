"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCuratedList,
  getUserCuratedListsByAddress,
  updateCuratedListTitle,
  type CuratedCollectionId,
} from "@/app/curated";
import _ from "lodash";
import { useProfile } from "@/hooks/useProfile";
import EditableText from "./EditableText";
import { NftImage } from "./NftCards";
import Link from "next/link";

export default function UserCuratedLists() {
  const queryClient = useQueryClient();
  const { user, address, ensName } = useProfile();
  const { data, isLoading } = useQuery(
    ["userCuratedLists", address],
    async () => getUserCuratedListsByAddress(address)
  );
  const { mutate: createNewList } = useMutation({
    mutationFn: () => createCuratedList(user.id, `List ${data?.length + 1}`),
    onSuccess: (a: any) => {
      queryClient.invalidateQueries({
        queryKey: ["userCuratedLists", address],
      });
    },
  });
  const { mutate: updateListName } = useMutation({
    mutationFn: ({
      list,
      title,
    }: {
      list: CuratedCollectionId;
      title: string;
    }) => {
      return updateCuratedListTitle(
        {
          slug: list.slug,
          curatorId: list.curatorId,
        },
        title
      );
    },
    onSuccess: (a: any) => {
      queryClient.invalidateQueries({
        queryKey: ["userCuratedLists", address],
      });
    },
  });

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-5">
        <h3 className="text-xl pl-3 pb-3 inline-block">Curated Lists</h3>
        <button
          className="btn btn-xs btn-secondary"
          onClick={() => createNewList()}
        >
          Create list
        </button>
      </div>
      <div className="p-2 pt-4 ">
        {!_.isEmpty(data) ? (
          _.map(data, (list, i) => {
            return (
              <div
                key={`userCuratedList${i}`}
                className="bg-gray-900 mb-10 px-1 flex flex-col"
              >
                <EditableText
                  label="List name"
                  initialValue={list.title}
                  updateHandler={(title) => updateListName({ list, title })}
                />
                {address && list.slug && (
                  <Link href={`/${ensName || address}/${list.slug}`}>
                    <div className="flex items-center justify-around bg-gray-900 hover:bg-gray-800 hover:scale-[102%] rounded-md p-0.5 transition-all m-2 mt-0">
                      {_.map(list.nfts, (nft, i) => {
                        return (
                          <div key={`${list.title}_${i}`} className="p-1.5">
                            <NftImage
                              src={_.get(nft, "nft.imageURI")}
                              alt={_.get(nft, "nft.title")}
                              size="sm"
                            />
                          </div>
                        );
                      })}
                      {_.isEmpty(list.nfts) && (
                        <div>Add some NFTs to visit this list</div>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            );
          })
        ) : (
          <div className="">
            <p className="bg-zinc-700 p-5 mb-3">You have no curated lists.</p>
            <button className="btn btn-primary" onClick={()=>createNewList()}>
              Create a curated list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
