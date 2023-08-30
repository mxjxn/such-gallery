import { useNft } from "@/hooks/useNft";
import { useQuery } from "@tanstack/react-query";
import _, { isDate } from "lodash";
import React, { useEffect } from "react";
import NftActions from "./NftActions";
import LabeledField from "./LabeledField";
import CopyTextComponent from "./CopyText";
import Image from "next/image";
import { NftId } from "@/types/types";
import { fetchListingData } from "@/app/manifold";

export default async function ManifoldListingPreview({
  listingId,
  onSave,
}: {
  listingId: number;
  onSave: () => void;
}) {
  const { data: listingData, isError: isListingError } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: async () => await fetchListingData(listingId),
  });

  const [nftId, setNftId] = React.useState<NftId | null>(null);

  useEffect(() => {
    const contractAddress = _.get(listingData, "token.address_");
    const tokenIdInt = parseInt(_.get(listingData, "token.id.hex", "-1"));
    const tokenId = tokenIdInt !== -1 ? tokenIdInt.toString() : undefined;
    if (contractAddress && tokenId) {
      setNftId({ contractAddress, tokenId });
    }
  }, [listingData]);

  const {
    data,
    isError: isDataError,
    isLoading,
  } = useNft(
    {
      contractAddress: nftId?.contractAddress,
      tokenId: nftId?.tokenId,
    },
    {
      isEnabled: !!nftId?.contractAddress && !!nftId?.tokenId,
    }
  );

  return (
    <div
      className={`text-3xl my-5 py-2 px-2 flex  xl:flex-row-reverse xs:items-center bg-slate-800 rounded-xl justify-around `}
    >
      {!!data &&
				data.title &&
				data.metadataURI &&
        data.contractAddress &&
        data.tokenId &&
        !isListingError &&
        !isDataError &&
        !!data.imageURI && (
          <div>
            <div className={` my-5 py-2 px-2  bg-slate-800 rounded-xl `}>
              <div
                className={`flex flex-col xl:flex-row-reverse xs:items-center justify-between`}
              >
                <div className="p-2 w-full bg-black block-inline flex justify-around rounded-md">
                  <Image
                    src={data.imageURI}
                    alt={data.title || ""}
                    width={256}
                    height={256}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="mt-3 xl:mt-0 xl:mr-3">
                    <LabeledField inline label={"Name"}>
                      <div className="text-lg">{data.title}</div>
                    </LabeledField>
                    <LabeledField inline label={"Creator"}>
                      {data?.metadata?.created_by}
                    </LabeledField>
                    <LabeledField inline label={"Contract"} className="p-0 m-0">
                      <CopyTextComponent
                        text={data.contractAddress}
                        className="py-1"
                      />
                    </LabeledField>
                    <LabeledField inline label={"Token ID"}>
                      {data.tokenId}
                    </LabeledField>
                  </div>
                  <div className={`w-full`}>
                    <NftActions
											nft={{
												contractAddress: data.contractAddress,
												tokenId: data.tokenId,
												metadata: data.metadata,
												metadataURI: data.metadataURI,
												imageURI: data.imageURI,
												title: data.title,
												seller: _.get(listingData, "seller"),
												listingType: _.get(listingData, "details.type_"),
												finalized: _.get(listingData, "finalized"),
												totalAvailable: _.get(listingData, "details.totalAvailable"),
												listingId: listingId,
											}}
											onSave={onSave}
										/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
