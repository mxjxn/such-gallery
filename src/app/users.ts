"use server";

import prisma from "@/prisma";
import { Prisma } from "@prisma/client";

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

export async function updateUserEns(address: string, ensName: string) {
  let updatedUser;
  if (ensName) {
    try {
      updatedUser = await prisma.user.update({
        where: { ethAddress: address },
        data: { ensName: ensName },
      });
    } catch (e: any) {
      throw new Error("error updating user", e);
    }
  }
  return updatedUser;
}

export async function updateName(ethAddress: string, name: string) {
  let updatedUser;
  try {
    updatedUser = await prisma.user.update({
      where: { ethAddress },
      data: { name },
    });
  } catch (e: any) {
    throw new Error("error updating user name", e);
  }
	return updatedUser;
}

export async function updateBio(ethAddress: string, bio: string) {
  let updatedUser;
  try {
    updatedUser = await prisma.user.update({
      where: { ethAddress },
      data: { bio },
    });
  } catch (e: any) {
    throw new Error("error updating user bio", e);
  }
	return updatedUser;
}
