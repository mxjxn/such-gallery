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

  /*
  useEffect(() => {
    console.log({
      startTime: listingData?.details.startTime,
      endTime: listingData?.details.endTime,
		  listingData
    });
  }, [listingId, listingData]);
*/

  const beginsInFuture =
    listingData?.details.startTime &&
    listingData?.details.startTime > Date.now() / 1000;
  const startDate = listingData?.details.startTime
    ? new Date(listingData.details.startTime * 1000)
    : undefined;
  const endDate = listingData?.details.endTime
    ? new Date(listingData.details.endTime * 1000)
    : undefined;

  return (
    <div className="mt-5">
      {/* seller */}
      {listingData?.seller && (
        <div className="p-2 text-xs">
          {/* use fetchEnsName */}
          {""}For sale by {listingData.seller}
        </div>
      )}

      {/* Start Date (if not live) */}
      {beginsInFuture && startDate && (
        <span>
          Auction begins:{" "}
          {startDate.toLocaleString("EN-us", {
            dateStyle: "short",
            timeStyle: "long",
          })}
        </span>
      )}

      <div className="flex p-2 justify-between">
        {/* Reserve Price */}
        {listingData?.details.initialAmount && (
          <div className="">
            <div className="text-xs">Reserve Price:</div>
            <div className="text-md">
              {!isERC20(listingData.details.erc20) &&
                handleEthValue(listingData.details.initialAmount.hex) + " ETH"}
            </div>
          </div>
        )}

        {/* highest bid */}
        {listingData?.bid && Number(listingData.bid.amount.hex) > 0 && (
          <div>
            <div className="text-xs">Highest Bid</div>
            <div className="text-md">
              {handleEthValue(listingData.bid.amount.hex)}
            </div>
          </div>
        )}

        {/* End Date (if live) */}
        {!beginsInFuture && listingData?.details.endTime && (
          <div className="text-sm">
            <div>Auction {listingData?.finalized ? " ended" : " ends"}</div>
            <div>
              on{" "}
              {listingData.details.endTime &&
                new Date(listingData.details.endTime * 1000).toLocaleDateString(
                  "EN-us",
                  {
                    dateStyle: "short",
                  }
                )}
            </div>
            <div>
              at{" "}
              {listingData.details.endTime &&
                new Date(listingData.details.endTime * 1000).toLocaleTimeString(
                  "EN-us",
                  {
                    timeStyle: "short",
                  }
                )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
