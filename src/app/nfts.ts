"use server";

import prisma from "@/prisma";
import { Prisma } from "@prisma/client";

export async function getNftsByUser(ethAddress: string) {
	const nfts = await prisma.user.findUnique({
		where: {
			ethAddress
		},
		include: {
			nfts: true,
		}
	});
	return nfts;
}

export async function addNftToUser(
  ethAddress: string,
  nftData: Prisma.NFTCreateInput,
) {
	// find or create the nft
	const nft = await prisma.nFT.upsert({
		where: { contractAddress_tokenId: { contractAddress: nftData.contractAddress, tokenId: nftData.tokenId } },
		update: {},
		create: nftData,
	});

	// find user and update nfts
	const userWithNft = await prisma.user.update({
		where: { ethAddress },
		data: {
			nfts: {
				connect: {
					id: nft.id,
				},
			},
		},
		include: {
			nfts: true,
		}
	});

	return userWithNft;
}

/*
export async function addNftToUser(
  ethAddress: string,
  nftData: Prisma.NFTCreateInput,
) {
	// find the nft
	const nft = await prisma.nFT.findUnique({{}})
	// if it doesnt exist, create it
	// if it exists, see if its in user's nfts
	// find users nfts
	const userNfts = await prisma.user.findUnique({})
	// if its there, do nothing
	// if its not there, add it to the user's nfts
  return userWithNft;
}
*/
