import _ from "lodash";

type BigNumber = {
  hex: string;
  type: "BigNumber";
};
type ListingDetails = {
  startTime: number; // in seconds. 0 means not started
  endTime: number; // in seconds
  erc20: string; // if zero, ETH is used
  totalPerSale: number;
  totalAvailable: number;
  extensionInterval: number;
  initialAmount: BigNumber;
  minIncrementBPS: number; // percentage that a bid must be raised to be valid
};
type Receiver = [address: string, amount: number];
type Bid = {
  amount: BigNumber;
  bidder: string;
  timestamp: number;
};

type ManifoldListingResponse = {
  details: ListingDetails;
  receivers: Receiver[];
  seller: string;
  finalized: boolean;
  bid: Bid;
};

export async function fetchListingData(
  id: number
): Promise<ManifoldListingResponse> {
  let result;
  try {
    result = await fetch(
      `https://marketplace.api.manifoldxyz.dev/listing/0x3a3548e060be10c2614d0a4cb0c03cc9093fd799/${id}`
    );
  } catch (e) {
    console.error(e);
    throw new Error("Unable to fetch listing data");
  }
  const json = await result.json();
  return json;
}
