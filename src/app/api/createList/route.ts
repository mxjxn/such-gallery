import prisma from "@/prisma";
import { FullNftWithListing } from "@/types/types";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { convertToKebabCase } from "@/utils/strings";

export async function POST(request: NextRequest) {
  const params = await request.json();
  const { userId, title }: { userId: number; title: string } = params;
  let list;
  try {
    list = await prisma.curatedCollection.create({
      data: {
        curatorId: userId,
        title: title,
        slug: convertToKebabCase(title),
      },
    });
  } catch (e: any) {
    console.error("Error creating list", e);
    throw new Error("Error creating list", e);
	}
  return NextResponse.json({ list });
}
