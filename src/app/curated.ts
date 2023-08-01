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

export async function getUserCuratedLists(userId: number): Promise<CuratedCollection[]> {
  const curatedCollections = await prisma.curatedCollection.findMany({
    where: {
      curatorId: userId,
    },
  });

  return curatedCollections;
}

export async function getUserCuratedListsByAddress(ethAddress: string): Promise<CuratedCollection[]> {
	const user = await prisma.user.findFirst({ where: { ethAddress } });
	if(!user) {
		return []
	}
  const curatedCollections = await prisma.curatedCollection.findMany({
    where: {
      curatorId: user.id,
    },
  });

  return curatedCollections;
}

export async function updateCuratedListTitle(id: number, title: string): Promise<CuratedCollection> {
	const curatedCollection = await prisma.curatedCollection.update({
		where: { id: id },
		data: { title: title }
	});
	return curatedCollection
}
