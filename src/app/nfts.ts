"use server";

import prisma from "@/prisma";
import { FullNft, FullNftWithListing } from "@/types/types";
import { Prisma } from "@prisma/client";
import _ from "lodash";

export async function getNftsByUser(ethAddress: string) {
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
  nftData: FullNft | FullNftWithListing
) {
  let nft: any;
  try {
    nft = await prisma.nFT.findUnique({
      where: {
        contractAddress_tokenId: {
          contractAddress: nftData.contractAddress,
          tokenId: nftData.tokenId,
        },
      },
      select: {
        id: true,
      },
    });
  } catch (e: any) {
    console.error("Error fetching existing NFT", e);
  }
  if (!nft?.id) {
    let listingData: any,
		    listingType: number = 0; // 0 is no listing, 1 is buynow, 2 is auction
    if ("listingId" in nftData) {
			listingType = nftData.listingType || 0;
      listingData = {
        connectOrCreate: {
          where: {
            listingId: nftData.listingId,
          },
          create: {
            listingId: nftData.listingId,
            seller: nftData.seller,
            finalized: nftData.finalized,
          },
        },
      };
      if (nftData.totalAvailable) {
        listingData.connectOrCreate.create.totalAvailable =
          nftData.totalAvailable;
      }
    }
    try {
      nft = await prisma.nFT.create({
        data: {
          metadataURI: nftData.metadataURI,
          imageURI: nftData.imageURI || "",
          title: nftData.title,
          description: nftData.description,
          tokenId: nftData.tokenId,
          manifoldBuyNowListing: listingType === 2 ? listingData : undefined,
          manifoldAuctionListing: listingType === 1 ? listingData : undefined,
          collection: {
            connectOrCreate: {
              where: {
                contractAddress: nftData.contractAddress,
              },
              create: {
                contractAddress: nftData.contractAddress,
                name: nftData.collectionName,
              },
            },
          },
        },
        select: {
          id: true,
        },
      });
    } catch (e: any) {
      throw new Error(e);
    }
  }

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

export async function removeNftFromUser(
  ethAddress: string,
  contractAddress: string,
  tokenId: string
) {
  const nftId: Prisma.NFTContractAddressTokenIdCompoundUniqueInput = {
    contractAddress,
    tokenId,
  };
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
