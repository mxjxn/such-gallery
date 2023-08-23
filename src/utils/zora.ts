import { Chain, Network, TokenQuery } from "@zoralabs/zdk/dist/queries/queries-sdk";
import {
  ZDKNetwork as N,
  ZDKChain as C,
} from "@zoralabs/zdk";

export const endpoint = "https://api.zora.co/graphql";
export type NetworkInput = {
  network: Network;
  chain: Chain;
};

export const networks: { network: Network; chain: Chain }[] = [
  {
    network: N.Ethereum,
    chain: C.Mainnet,
  },
  {
    network: N.Optimism,
    chain: C.OptimismMainnet,
  },
  {
    network: N.Zora,
    chain: C.ZoraMainnet,
  },
  {
    network: N.Base,
    chain: C.BaseMainnet,
  },
];

export const NetworkNames: { [key: string]: NetworkInput } = {
  Ethereum: networks[0],
  Optimism: networks[1],
  Zora: networks[2],
  Base: networks[3],
};
