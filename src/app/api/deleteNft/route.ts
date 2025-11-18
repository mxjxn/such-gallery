import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { ethAddress, nftId } = Object.fromEntries(searchParams.entries());
  let deleteNft;
  try {
    deleteNft = await prisma.user.update({
      where: {
        ethAddress: ethAddress,
      },
      data: {
        nfts: {
          disconnect: {
            id: Number(nftId),
          },
        },
      },
    });
  } catch (e: any) {
    console.error("Error deleting NFT", e);
    throw new Error("Error deleting NFT", e);
  }
  return NextResponse.json({ nfts: deleteNft });
}
