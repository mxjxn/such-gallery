"use server";

import prisma from "@/prisma";
import { UserData } from "@/types/types";
import { Prisma } from "@prisma/client";

async function prismaUpdate(ethAddress: string, data: Partial<UserData>) {
  let updatedUser;
  try {
    updatedUser = await prisma.user.update({
      where: { ethAddress },
      data,
    });
  } catch (e: any) {
    throw new Error(`error updating user, ${e}`);
  }
  return updatedUser;
}

export async function getUser(address: string) {
  // get it from the db
  let userInDb, createUser;
  try {
    userInDb = await prisma.user.findUnique({ where: { ethAddress: address } });
  } catch (e: any) {
    throw new Error("error finding unique user", e);
  }
  if (userInDb?.id && userInDb?.ethAddress) {
    return userInDb;
  }
  try {
    createUser = await prisma.user.create({ data: { ethAddress: address } });
  } catch (e: any) {
    throw new Error("error creating unique user", e);
  }
  return createUser;
}

export const updateName = (address: string, name: string) =>
  prismaUpdate(address, { name });

export const updateBio = (address: string, bio: string) =>
  prismaUpdate(address, { bio });

export async function updateUserEns(address: string, ensName: string) {
  let updatedUser;
  if (ensName) {
		updatedUser = prismaUpdate(address, { ensName });
  }
  return updatedUser;
}
