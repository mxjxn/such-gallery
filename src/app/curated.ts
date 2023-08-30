"use server";
import prisma from "@/prisma";
import { FullNft, FullNftWithListing } from "@/types/types";
import { SITE_URL } from "@/utils/config";
import { convertToKebabCase } from "@/utils/strings";
import {
  CuratedCollection,
  CuratedCollectionNFT,
  Prisma,
} from "@prisma/client";
import _ from "lodash";

export async function createCuratedList(
  userId: number,
  title: string = "untitled"
) {
  return await fetch(`${SITE_URL}/api/createList`, {
		method: "POST",
		body: JSON.stringify({ userId, title })
	})
}

export async function addNftToCuratedList(
  nftId: number,
  listId: number
){
	return await fetch(`${SITE_URL}/api/addToList`, {
		method: "POST",
		body: JSON.stringify({ nftId, listId })
	})
}

export async function addNewNftToCuratedList(
  nftData: FullNftWithListing,
  listId: number
) {
	let nft = await fetch(`${SITE_URL}/api/submitNft`, {
		method: "POST",
		body: JSON.stringify({ nftData })
	})
	const nftResult = await nft.json();
	console.log(" about to do some shit ", nftResult)
	let curatedList;
	if(nftResult?.id) {
		curatedList = await fetch(`${SITE_URL}/api/addToList`, {
			method: "POST",
			body: JSON.stringify({ nftId: nftResult.id, listId })
		});
	}
	return curatedList?.json();
}


export async function getUserCuratedLists(
  userId: number
): Promise<CuratedCollection[]> {
  const curatedCollections = await prisma.curatedCollection.findMany({
    where: {
      curatorId: userId,
    },
    include: {
      nfts: {
        include: {
          nft: true,
        },
      },
    },
  });

  return curatedCollections;
}

export async function getUserCuratedListsByAddress(
  ethAddress: string
): Promise<any> {
  const user = await prisma.user.findFirst({ where: { ethAddress } });
  if (!user) {
    return [];
  }
  const curatedCollections = await prisma.curatedCollection.findMany({
    where: {
      curatorId: user.id,
    },
    select: {
      title: true,
      curatorId: true,
      slug: true,
      nfts: {
        include: {
          nft: true,
        },
      },
    },
  });

  return curatedCollections;
}

export type CuratedCollectionId = {
  curatorId: number;
  slug: string;
};

export async function updateCuratedListTitle(
  collection: CuratedCollectionId,
  title: string
): Promise<CuratedCollection> {
  const curatedCollection = await prisma.curatedCollection.update({
    where: {
      curatorId_slug: {
        curatorId: collection.curatorId,
        slug: collection.slug,
      },
    },
    data: {
      title: title,
      slug: convertToKebabCase(title),
    },
  });
  return curatedCollection;
}

export async function updateNftCuratorComment(
  curation: number,
  id: number,
  note: string
): Promise<CuratedCollectionNFT> {
  const updatedCuration = await prisma.curatedCollectionNFT.update({
    where: {
      curatedCollectionId_nftId: {
        curatedCollectionId: curation,
        nftId: id,
      },
    },
    data: { curatorComment: note },
  });
  return updatedCuration;
}

export async function updateNftCurationDescription(
  curation: number,
  id: number,
  toggle: boolean
): Promise<CuratedCollectionNFT> {
  const updatedCuration = await prisma.curatedCollectionNFT.update({
    where: {
      curatedCollectionId_nftId: {
        curatedCollectionId: curation,
        nftId: id,
      },
    },
    data: {
      showDescription: toggle,
    },
  });
  return updatedCuration;
}
