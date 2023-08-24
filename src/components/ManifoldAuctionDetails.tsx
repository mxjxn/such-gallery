"use client";
import React, { useEffect } from "react";
import { FullNft } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { fetchListingData } from "@/app/manifold";
import handleEthValue, { isERC20 } from "@/lib/handleEthValue";
export default function ManifoldAuctionDetails({
  listingId,
}: {
  listingId: { finalized: boolean; listingId: number; seller: string };
}) {
  const { data: listingData, isError: isListingError } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: async () => await fetchListingData(listingId.listingId),
    enabled: !!listingId,
  });

  useEffect(() => {
    console.log({
      startTime: listingData?.details.startTime,
      endTime: listingData?.details.endTime,
    });
  }, [listingId, listingData]);

	const beginsInFuture = listingData?.details.startTime && listingData?.details.startTime > Date.now() / 1000;
	const startDate = listingData?.details.startTime ? new Date(listingData.details.startTime*1000) : undefined

  return (
    <div>
      <div className="">{""} Auction</div>
      {listingData?.details.initialAmount && (
        <div className="">
          Reserve Price: {handleEthValue(listingData.details.initialAmount.hex)}
          {!isERC20(listingData.details.erc20) && " ETH"}
        </div>
      )}
			{beginsInFuture && startDate && (
				<span>Auction begins: {startDate.toLocaleString("EN-us", {dateStyle: "short", timeStyle: "long"})}</span>
			)} 
      {!beginsInFuture && listingData?.details.startTime && (
        <div className="text-xl">
          Auction
          {listingData?.finalized ? " ended" : " ends"} at{" "}
          {new Date(listingData.details.endTime * 1000).toLocaleString(
            "EN-us",
            {
              dateStyle: "short",
              timeStyle: "long",
            }
          )}
        </div>
      )}

      {listingData?.seller && (
        <div className="">
          {""}For sale by {listingData.seller}
        </div>
      )}
    </div>
  );
}
