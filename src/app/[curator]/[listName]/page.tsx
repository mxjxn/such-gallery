import { comicNeue } from "@/fonts";
import prisma from "@/prisma";
import { Prisma } from "@prisma/client";
import _ from "lodash";
import Image from "next/image";
import Description from "./Description";
import CuratorComment from "./CuratorComment";
import ManifoldAuctionDetails from "@/components/ManifoldAuctionDetails";

async function getList(curator: string, slug: string) {
  "use server";
  const isEnsName: boolean = _.endsWith(curator, ".eth");
  const isEthAddress: boolean =
    _.startsWith(curator, "0x") && curator.length === 42;
  const curatorLookup: Prisma.UserWhereUniqueInput = isEnsName
    ? { ensName: curator }
    : isEthAddress
    ? { ethAddress: curator }
    : { id: -1 };
  if (curatorLookup.id === -1) {
    console.error("user not found");
    return null;
  }
  const curatorData = await prisma.user.findUnique({
    where: curatorLookup,
    select: {
      id: true,
    },
  });
  // if no user found, throw an error
  if (!curatorData) {
    throw new Error("user not found");
  }

  // otherwise if its a valid eth address
  const collection = await prisma.curatedCollection.findUnique({
    where: {
      curatorId_slug: {
        curatorId: curatorData.id,
        slug: slug,
      },
    },
    select: {
      title: true,
      id: true,
      curator: {
        select: {
          name: true,
          ensName: true,
          ethAddress: true,
          id: true,
          bio: true,
        },
      },
      nfts: {
        select: {
          nft: {
            select: {
              title: true,
              description: true,
              contractAddress: true,
              tokenId: true,
							manifoldBuyNowListing: true,
							manifoldAuctionListing: true,
              metadataURI: true,
              imageURI: true,
              id: true,
            },
          },
          curatorComment: true,
          showAttributes: true,
          showDescription: true,
          nftId: true,
        },
      },
    },
  });

  return collection;
}

export default async function Page({
  params,
}: {
  params: { curator: string; listName: string };
}) {
  // take listName, do a prisma lookup
  const data = await getList(params.curator, params.listName);
  const list: any = _.map(data?.nfts, (nft) => ({
    curatorComment: nft.curatorComment || "",
    curationId: nft.nftId,
    ...nft.nft,
  }));
  const curator = data?.curator;
  return (
    <div className="p-8">
      <div className="w-full flex flex-col items-center">
        <div className="xs:w-full sm:w-4/5 md:w-3/4 lg:w-3/5 transition-all">
          <div className="mb-24">
            <div className={`text-5xl mb-5 ${comicNeue.className}`}>
              {data?.title}
            </div>
            <div className="text-lg italic">
              curated by {curator?.name}
              <div className={`text-xs inline-block mx-2`}>
                {curator?.ensName}
              </div>
            </div>
          </div>
          {_.map(list, (nft, i) => {
            return (
              <div
                className="flex flex-col mt-8 mb-36 -mx-5"
                key={`nft-${i}-${nft.title}`}
              >
                {!!nft.curatorComment && (
                  <CuratorComment
                    comment={nft.curatorComment}
                    listId={data?.id || -1}
                    nftId={nft.curationId}
                    curatorId={curator?.id}
                  />
                )}
                <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-gray-800 rounded-xl p-5 mb-5 h-4/5">
                  <Image
                    src={nft.imageURI}
                    width={1000}
                    height={1000}
                    className="relative block"
                    alt={nft.title}
                  />
                </div>
                <p
                  className={`
								text-3xl 
								mx-5
								font-bold
								tracking-wide
								${comicNeue.className}
								`}
                >
                  {nft.title}
                </p>
                {nft.showDescription && (
                  <Description description={nft.description} />
                )}
                {!!nft.manifoldBuyNowListing && (
                  <div className="text-xl">Buy me now</div>
                )}
                {!!nft.manifoldAuctionListing && (
                  <ManifoldAuctionDetails
                    listingId={nft.manifoldAuctionListing}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
