import { Nft } from "@/types/types";

export function parseZoraUrl(url: string): Nft | null {
  const regex = /^https:\/\/zora\.co\/(\w+)\/eth:([a-zA-Z0-9]+)\/(\d+)$/g;
  const result = regex.exec(url);
  return result ? { chain: 'eth', contractAddress: result[2], tokenId: result[3] } : null;
}

export function parseOpenSeaUrl(url: string): Nft | null {
  const regex = /^https:\/\/opensea\.io\/assets\/(\w+)\/([a-zA-Z0-9]+)\/(\d+)$/g;
  const result = regex.exec(url);
  return result ? { chain: result[1], contractAddress: result[2], tokenId: result[3] } : null;
}

export function parseEtherscanUrl(url: string): Nft | null {
  const regex = /^https:\/\/etherscan\.io\/nft\/([a-zA-Z0-9]+)\/(\d+)$/g;
  const result = regex.exec(url);
  return result ? { chain: 'eth', contractAddress: result[1], tokenId: result[2] } : null;
}

export function parseManifoldUrl(url: string): Nft | null {
  const regex = /^https:\/\/gallery\.manifold\.xyz\/((\w+\/)?)(([a-zA-Z0-9]+)\/(\d+))$/g;
  const result = regex.exec(url);
  
  if (result) {
    let chain = 'eth';
    if (result[2]) {
      chain = result[2].slice(0, -1);
    }

    return { chain, contractAddress: result[4], tokenId: result[5] };
  }

  return null;
}
