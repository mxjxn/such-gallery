import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { address } = Object.fromEntries(searchParams.entries());

  // this should be authenticated

  const user = await prisma.user.findUnique({
    where: {
      ethAddress: address,
    },
    include: {
      nfts: { take: 30 },
    },
  });
  if (user?.nfts) {
    return NextResponse.json(user?.nfts);
  }
  return NextResponse.json([]);
}
