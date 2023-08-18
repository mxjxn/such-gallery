import { comicNeue } from "@/fonts";
import prisma from "@/prisma";
import { Prisma } from "@prisma/client";
import _ from "lodash";
import Image from "next/image";
import Description from "./Description";
import CuratorComment from "./CuratorComment";

async function getList(slug: string) {
  "use server";
  return await prisma.curatedCollection.findUnique({
    where: {
      slug,
    },
    select: {
      title: true,
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
							metadataURI: true,
							imageURI: true,
							id: true
						}
					},
					curatorComment: true,
					nftId: true
				},
      },
    },
  });
}

export default async function Page({
  params,
}: {
  params: { listName: string };
}) {
  // take listName, do a prisma lookup
  const data = await getList(params.listName);
  const list: any = _.map(data?.nfts, (nft) => ({
		curatorComment: nft.curatorComment || "",
		curationId: nft.id,
		...nft.nft,
	}));
  const curator = data?.curator;

  console.log(data);

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
								<CuratorComment
									comment={nft.curatorComment}
									curationId={nft.curationId}
								/>
                <Description description={nft.description} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
