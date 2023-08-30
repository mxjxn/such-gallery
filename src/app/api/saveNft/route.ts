import prisma from "@/prisma";
import { FullNftWithListing } from "@/types/types";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const params = await request.json();

  const {
    ethAddress,
    nftData,
  }: { ethAddress: string; nftData: FullNftWithListing } = params;

  const { contractAddress, tokenId } = nftData;

  let nfts;
  try {
    nfts = await prisma.user.update({
      where: {
        ethAddress,
      },
      data: {
        nfts: {
          connectOrCreate: {
            where: {
              contractAddress_tokenId: {
                contractAddress,
                tokenId,
              },
            },
            create: {
              tokenId: nftData.tokenId,
              contractAddress: nftData.contractAddress,
              metadataURI: nftData.metadataURI || "",
              imageURI: nftData.imageURI || "",
              title: nftData.title,
              description: nftData.description || "",
            },
          },
        },
      },
      select: {
        nfts: true,
      },
    });
  } catch (e: any) {
    console.error("error upserting nft", e);
    throw new Error(e);
  }

  if (nftData.listingId && !_.isEmpty(nfts)) {
    const listingObj: {
      listingId: number;
      seller: string;
      finalized: boolean;
      totalAvailable?: number;
    } = {
      listingId: nftData.listingId,
      seller: nftData.seller || "",
      finalized: nftData.finalized || false,
    };
    const queryObj = {
      connectOrCreate: {
        where: {
          listingId: nftData.listingId,
        },
        create: {},
      },
    };
    let listingTypeObj: {
      manifoldBuyNowListing?: any;
      manifoldAuctionListing?: any;
    } = {};
    if (nftData.listingType == 1) {
      queryObj.connectOrCreate.create = listingObj;
      listingTypeObj.manifoldAuctionListing = queryObj;
    } else if (nftData.listingType == 2) {
      listingObj.totalAvailable = nftData.totalAvailable || 0;
      queryObj.connectOrCreate.create = listingObj;
      listingTypeObj.manifoldBuyNowListing = queryObj;
    }

    const nft = await prisma.nFT.update({
      where: {
        contractAddress_tokenId: {
          contractAddress: nftData.contractAddress,
          tokenId: nftData.tokenId,
        },
      },
      data: {
        ...listingTypeObj,
      },
    });
  }

  return NextResponse.json({ nfts });
}
