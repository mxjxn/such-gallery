import { type Address } from 'viem';
import { BASE_CHAIN_ID } from './constants';

// Auctionhouse Marketplace contract address on Base Mainnet
export const AUCTIONHOUSE_ADDRESS = (
  process.env.NEXT_PUBLIC_AUCTIONHOUSE_ADDRESS ||
  '0x1Cb0c1F72Ba7547fC99c4b5333d8aBA1eD6b31A9'
) as Address;

// Minimal ABI for purchase and bid functions with referrer support
export const AUCTIONHOUSE_ABI = [
  {
    type: 'function',
    name: 'purchase',
    inputs: [
      { name: 'listingId', type: 'uint40', internalType: 'uint40' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'purchase',
    inputs: [
      { name: 'referrer', type: 'address', internalType: 'address' },
      { name: 'listingId', type: 'uint40', internalType: 'uint40' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'purchase',
    inputs: [
      { name: 'referrer', type: 'address', internalType: 'address' },
      { name: 'listingId', type: 'uint40', internalType: 'uint40' },
      { name: 'count', type: 'uint24', internalType: 'uint24' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'bid',
    inputs: [
      { name: 'listingId', type: 'uint40', internalType: 'uint40' },
      { name: 'increase', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'bid',
    inputs: [
      { name: 'referrer', type: 'address', internalType: 'address payable' },
      { name: 'listingId', type: 'uint40', internalType: 'uint40' },
      { name: 'increase', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getListing',
    inputs: [{ name: 'listingId', type: 'uint40', internalType: 'uint40' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IMarketplaceCore.Listing',
        components: [
          { name: 'id', type: 'uint256', internalType: 'uint256' },
          { name: 'seller', type: 'address', internalType: 'address payable' },
          { name: 'finalized', type: 'bool', internalType: 'bool' },
          { name: 'totalSold', type: 'uint24', internalType: 'uint24' },
          { name: 'marketplaceBPS', type: 'uint16', internalType: 'uint16' },
          { name: 'referrerBPS', type: 'uint16', internalType: 'uint16' },
          {
            name: 'details',
            type: 'tuple',
            internalType: 'struct MarketplaceLib.ListingDetails',
            components: [
              { name: 'initialAmount', type: 'uint256', internalType: 'uint256' },
              { name: 'type_', type: 'uint8', internalType: 'enum MarketplaceLib.ListingType' },
              { name: 'totalAvailable', type: 'uint24', internalType: 'uint24' },
              { name: 'totalPerSale', type: 'uint24', internalType: 'uint24' },
              { name: 'extensionInterval', type: 'uint16', internalType: 'uint16' },
              { name: 'minIncrementBPS', type: 'uint16', internalType: 'uint16' },
              { name: 'erc20', type: 'address', internalType: 'address' },
              { name: 'identityVerifier', type: 'address', internalType: 'address' },
              { name: 'startTime', type: 'uint48', internalType: 'uint48' },
              { name: 'endTime', type: 'uint48', internalType: 'uint48' },
            ],
          },
          {
            name: 'token',
            type: 'tuple',
            internalType: 'struct MarketplaceLib.TokenDetails',
            components: [
              { name: 'id', type: 'uint256', internalType: 'uint256' },
              { name: 'address_', type: 'address', internalType: 'address' },
              { name: 'spec', type: 'uint8', internalType: 'enum TokenLib.Spec' },
              { name: 'lazy', type: 'bool', internalType: 'bool' },
            ],
          },
          {
            name: 'bid',
            type: 'tuple',
            internalType: 'struct MarketplaceLib.Bid',
            components: [
              { name: 'amount', type: 'uint256', internalType: 'uint256' },
              { name: 'bidder', type: 'address', internalType: 'address payable' },
              { name: 'delivered', type: 'bool', internalType: 'bool' },
              { name: 'settled', type: 'bool', internalType: 'bool' },
              { name: 'refunded', type: 'bool', internalType: 'bool' },
              { name: 'timestamp', type: 'uint48', internalType: 'uint48' },
              { name: 'referrer', type: 'address', internalType: 'address payable' },
            ],
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getListingCurrentPrice',
    inputs: [{ name: 'listingId', type: 'uint40', internalType: 'uint40' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

export const CHAIN_ID = BASE_CHAIN_ID;

