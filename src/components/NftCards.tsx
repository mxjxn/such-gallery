"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  XCircleIcon,
  FolderPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import _ from "lodash";
import {
  addNewNftToCuratedList,
  addNftToCuratedList,
  getUserCuratedLists,
} from "@/app/curated";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useProfile } from "@/hooks/useProfile";
import { Prisma } from "@prisma/client";
import { FullNft, FullNftWithListing } from "@/types/types";

const imageSizes = { xs: 30, sm: 60, md: 120, lg: 240, xl: 480, "2xl": 960 };

const scaledSize = (w: number, h: number, scale: number) => {
  const landscape = w > h;
  const scaledW = landscape ? scale : (scale * w) / h;
  const scaledH = landscape ? (scale * h) / w : scale;
  return [scaledW, scaledH];
};

export function NftImage({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const width = imageSizes[size];
  const height = imageSizes[size];
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt + "- nft primary image"}
    />
  );
}

export async function NftPreviewLoading() {
  return (
    <div className="my-5 pt-5 py-2 px-2 flex flex-col xl:flex-row-reverse xs:items-center bg-slate-800 justify-between rounded-lg">
      <div className="loading loading-ball loading-lg" />
    </div>
  );
}

const NftCard = ({
  title,
  imageURI,
  key,
  size = "sm",
  onDelete,
}: {
  title: string;
  imageURI: string;
  key?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  onDelete: () => Promise<void> | null;
}) => (
  <div
    className={`
			w-48
			m-2
			bg-gradient-to-br
			from-stone-800
			to-gray-800
			rounded-lg
			flex
			justify-around
			py-2
			border-4
			border-slate-700
			hover:from-stone-700
			hover:to-gray-700
		`}
  >
    {title && imageURI && (
      <div
        className="flex flex-col items-center justify-around flex-wrap text-xs"
        key={key}
      >
        <div className="w-full flex justify-around px-4 py-2 m-0 bg-black">
          <NftImage src={imageURI} alt={title} size={size} />
        </div>
        <div className="mt-3 flex justify-between items-center px-3">
          <p className="px-3 inline">{title}</p>
          {!!onDelete && (
            <XCircleIcon
              className="text-red-500 w-4 h-4"
              onClick={() => onDelete()}
            />
          )}
        </div>
      </div>
    )}
  </div>
);

export const CurateWithoutSaving = ({
  nft,
}: {
  nft: FullNft | FullNftWithListing;
}) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user, address } = useProfile();
  const { data, isLoading } = useQuery(
    ["userCuratedLists", address],
    async () => getUserCuratedLists(user.id)
  );
  const { mutate: addToList } = useMutation({
    mutationFn: (listId: number) => {
      return addNewNftToCuratedList(nft, listId);
    },
    onSuccess: (e: any) => {
      queryClient.invalidateQueries(["userCuratedLists", address]);
    },
  });

  return (
    <div className="text-secondary hover:text-secondary-focus active:text-secondary-content">
      <div
        className="dropdown dropdown-end"
        onClick={() => {
          setOpen(!open);
        }}
      >
        <label
          tabIndex={0}
          className="btn m-1"
          onClick={(e) => e.preventDefault()}
        >
          Add to list
        </label>
        <ul
          tabIndex={0}
          className={`dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 ${
            open ? "block" : "hidden"
          }`}
        >
          {!_.isEmpty(data) &&
            _.map(data, (list, i) => (
              <li key={`add-${nft.contractAddress}/${nft.tokenId}${i}`}>
                <a
                  onClick={() => {
                    addToList(list.id);
                    setOpen(false);
                  }}
                >
                  {list.title}
                </a>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
/*
 <details
        className="dropdown dropdown-end"
        open={open}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <summary
          tabIndex={0}
          className="m-1 btn"
          onClick={(e) => e.preventDefault()}
        >
          <FolderPlusIcon className="w-6 h-6 inline-block pr-1" />
          <div className="inline-block text-xs">add to list</div>
        </summary>
        <ul
          tabIndex={0}
          className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52"
        >
          {!_.isEmpty(data) &&
            _.map(data, (list) => (
              <li key={`add-${nft.contractAddress}/${nft.tokenId}`}>
                <a
                  onClick={() => {
                    addToList(list.id);
                    setOpen(false);
                  }}
                >
                  {list.title}
                </a>
              </li>
            ))}
        </ul>
      </details>
 * */

const AddToList = ({ nftId }: { nftId: number }) => {
  // react query to get user's lists
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user, address } = useProfile();
  const { data, isLoading } = useQuery(
    ["userCuratedLists", address],
    async () => getUserCuratedLists(user.id)
  );
  const { mutate: addToList } = useMutation({
    mutationFn: (listId: number) => {
      return addNftToCuratedList(nftId, listId);
    },
    onSuccess: (e: any) => {
      queryClient.invalidateQueries(["userCuratedLists", address]);
    },
  });

  return (
    <div className="text-secondary hover:text-secondary-focus active:text-secondary-content">
      <details
        className="dropdown dropdown-end"
        open={open}
        onClick={() => {
          !open && setOpen(!open);
        }}
      >
        <summary className="m-1 btn" onClick={(e) => e.preventDefault()}>
          <FolderPlusIcon className="w-6 h-6 inline-block pr-1" />
          <div className="inline-block text-xs">add to list</div>
        </summary>
        <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
          {!_.isEmpty(data) &&
            _.map(data, (list) => (
              <li key={`add-${nftId}-to-${list.id}`}>
                <a
                  onClick={() => {
                    addToList(list.id);
                    setOpen(false);
                  }}
                >
                  {list.title}
                </a>
              </li>
            ))}
        </ul>
      </details>
    </div>
  );
};

const NftListItem = ({
  title,
  imageURI,
  nft,
  key,
  onDelete,
  onClose,
  isOpen,
  onSelect,
  onAddToList,
}: {
  title: string;
  imageURI: string;
  nft: any;
  key?: string;
  onDelete: () => Promise<void> | null;
  onClose: () => void;
  isOpen: boolean;
  onSelect: () => void;
  onAddToList: (id: number) => void;
}) => {
  return (
    <div
      key={key}
      className={`relative px-2 flex flex-row gap-4 bg-gradient-to-r from-slate-800 to-slate-700 p-1 transition-all
				${
          isOpen
            ? "flex-wrap items-start pt-3"
            : "hover:from-slate-500 hover:to-slate-600 items-center"
        }
			`}
      onClick={onSelect}
    >
      {isOpen && (
        <div
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-300 hover:text-gray-50 active:text-gray-800"
        >
          <XMarkIcon className="w-6 h-6 inline-block pr-1" />
        </div>
      )}
      <div className={isOpen ? "p-3 bg-black" : "bg-black p-1"}>
        <NftImage src={imageURI} alt={title} size={isOpen ? "md" : "xs"} />
      </div>
      <div
        className={`
					flex
					${isOpen ? "flex-col justify-start" : "justify-between"}
				`}
      >
        <div className="flex items-center justify-between">
          <div className={isOpen ? `` : ""}>{title}</div>
        </div>

        {isOpen && !!onDelete && (
          <div className="flex justify-start items-center">
            <AddToList nftId={nft.id} />
            <div className="text-red-500 hover:text-red-400 active:text-red-300 pr-2 m-2">
              <XCircleIcon
                className=" w-6 h-6 inline-block pr-1"
                onClick={() => {
                  onDelete();
                }}
              />
              <div className="inline-block text-xs">remove from saved</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { NftListItem, NftCard, AddToList };
