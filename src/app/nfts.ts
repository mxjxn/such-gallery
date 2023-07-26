"use server";

import prisma from "@/prisma";
import { Prisma } from "@prisma/client";

export async function getNftsByUser(ethAddress: string) {
	console.log({ ethAddress })
  const user = await prisma.user.findUnique({
    where: {
      ethAddress,
    },
    include: {
      nfts: true,
    },
  });
  return user?.nfts;
}

export async function addNftToUser(
  ethAddress: string,
  nftData: Prisma.NFTCreateInput
) {
  // Try to find the NFT first
  let nft: any;
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
    throw new Error(e);
  }
	
	console.log('findUnique nft result', {nft})

  // If not found - create it
  if (!nft) {
    console.log({ nftData });
    try {
      nft = await prisma.nFT.create({
        data: nftData,
      });
    } catch (e: any) {
      throw new Error(e);
    }
    console.log("Created NFT", nft);
  }

	console.log('create nft result', {nft})

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
    },
  });

  return userWithNft;
}

// please write the following function:
// export async function removeNftFromUser
export async function deleteNftFromUser(
  ethAddress: string,
  contractAddress: string,
  tokenId: string
) {
  // Find the NFT
  const nft = await prisma.nFT.findUnique({
    where: {
      contractAddress_tokenId: {
        contractAddress,
        tokenId,
      },
    },
  });

  if (!nft) {
    throw new Error("NFT not found");
  }

  // Find the user and disconnect the NFT
  const userWithoutNft = await prisma.user.update({
    where: { ethAddress },
    data: {
      nfts: {
        disconnect: {
          id: nft.id,
        },
      },
    },
    include: {
      nfts: true,
    },
  });

  return userWithoutNft;
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

export async function removeNftFromUser(ethAddress: string, contractAddress: string, tokenId:string) {

	const nftId: Prisma.NFTContractAddressTokenIdCompoundUniqueInput = { contractAddress, tokenId };

  const userWithNftRemoved = await prisma.user.update({
    where: { ethAddress },
    data: {
      nfts: {
        disconnect: {
          contractAddress_tokenId: nftId,
        },
      },
    },
    include: {
      nfts: true,
    },
  });

  return userWithNftRemoved;
}
