"use server";

import prisma from "@/prisma";
import {
  CuratedCollection,
  CuratedCollectionNFT,
  Prisma,
} from "@prisma/client";
import _ from "lodash";

function convertToKebabCase(str: string): string {
    // Convert to lowercase and replace unwanted characters and spaces with hyphens
    let result = str.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Remove leading or trailing hyphens
    result = result.replace(/^-|-$/g, '');

    // Limit to 5 words
    let words = result.split('-');
    if (words.length > 5) {
        result = words.slice(0, 5).join('-');
    }

    return result;
}


export async function createCuratedList(
  userId: number,
  title: string = "untitled"
): Promise<CuratedCollection | null> {
  const curatedList = await prisma.curatedCollection.create({
    data: {
      curatorId: userId,
      title: title,
			slug: convertToKebabCase(title),
    },
  });

  return curatedList;
}

export async function addNftToCuratedList(
  nftId: number,
  listId: number
): Promise<CuratedCollection> {
  const curatedCollectionNFT = await prisma.curatedCollectionNFT.create({
    data: {
      curatedCollectionId: listId,
      nftId: nftId,
    },
  });
  return prisma.curatedCollection.findUnique({
    where: { id: curatedCollectionNFT.curatedCollectionId },
    include: { nfts: true },
  });
}

export async function addNewNftToCuratedList(
  nftData: Prisma.NFTCreateInput,
  listId: number
): Promise<CuratedCollection | null> {
  let nft, curatedCollectionNFT, resultingCollection;
  try {
    nft = await prisma.nFT.findUnique({
      where: {
        contractAddress_tokenId: {
          contractAddress: nftData.contractAddress,
          tokenId: nftData.tokenId,
        },
      },
    });
  } catch (e: any) {
    console.error("Error fetching existing NFT", e);
  }
  if (!nft) {
    try {
      nft = await prisma.nFT.create({
        data: nftData,
      });
    } catch (e: any) {
      console.error("Error saving NFT to server", e);
    }
  }
  if (!_.isEmpty(nft)) {
    try {
      curatedCollectionNFT = await prisma.curatedCollectionNFT.create({
        data: {
          curatedCollectionId: listId,
          nftId: nft.id,
        },
      });
    } catch (e: any) {
      console.error("Error saving curatedCollectionNFT to server", e);
    }
  }
  if (!_.isEmpty(curatedCollectionNFT)) {
    try {
      resultingCollection = prisma.curatedCollection.findUnique({
        where: { id: curatedCollectionNFT.curatedCollectionId },
        include: { nfts: true },
      });
    } catch (e: any) {
      console.error("Error fetching finalized curatedCollection", e);
    }
  }
  return resultingCollection;
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

export async function updateCuratedListTitle(
  id: number,
  title: string
): Promise<CuratedCollection> {
  const curatedCollection = await prisma.curatedCollection.update({
    where: { id: id },
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
	console.log({updatedCuration});
	return updatedCuration;
}
