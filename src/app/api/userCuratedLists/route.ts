import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import _ from "lodash";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { address } = Object.fromEntries(searchParams.entries());

  // this should be authenticated

  const user = await prisma.user.findUnique({
    where: {
      ethAddress: address,
    },
    include: {
      curatedCollections: { take: 10 },
    },
  });
  if (!_.isEmpty(user?.curatedCollections)) {
    return NextResponse.json({ curatedCollections: user?.curatedCollections });
  }
  return NextResponse.json({ curatedCollections: [] });
}
