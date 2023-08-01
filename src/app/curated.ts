"use server";

import prisma from "@/prisma";
import { CuratedCollection, Prisma } from "@prisma/client";

export async function createCuratedList(
  userId: number,
  title?: string
): Promise<CuratedCollection | null> {
  const curatedList = await prisma.curatedCollection.create({
    data: {
      curatorId: userId,
      title: title || "untitled",
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
					nft: true
				}
			}
		}
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
		include: {
			nfts: {
				include: {
					nft: true
				}
			}
		}
  });

  return curatedCollections;
}

export async function updateCuratedListTitle(
  id: number,
  title: string
): Promise<CuratedCollection> {
  const curatedCollection = await prisma.curatedCollection.update({
    where: { id: id },
    data: { title: title },
  });
  return curatedCollection;
}
