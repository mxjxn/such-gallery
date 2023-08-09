import { Nft } from "@/types/types";

interface IUrlParser {
  validate: (url: string) => boolean;
  parse: (url: string) => Nft | null;
}

// Generic function to create a validator and a parser
function createUrlParser(regex: RegExp, chain: string, contractIdx: number, tokenIdIdx: number): IUrlParser {
  return {
    validate: (url: string) => regex.test(url),
    parse: (url: string) => {
      const result = regex.exec(url);
      return result ? { chain, contractAddress: result[contractIdx], tokenId: result[tokenIdIdx] } : null;
    },
  };
}

const urlParsers: IUrlParser[] = [
  createUrlParser(/^https?:\/\/(www\.)?artblocks\.io\/.*\/(0x[a-fA-F0-9]{40})\/\d+\/tokens\/(\d+)$/, "eth", 2, 3),
  createUrlParser(/^https:\/\/opensea\.io\/assets\/(\w+)\/([a-zA-Z0-9]+)\/(\d+)$/, "eth", 2, 3),
  createUrlParser(/^https:\/\/zora\.co\/(\w+)\/eth:(0x[a-fA-F0-9]{40})\/(\d+)$/, "eth", 2, 3),
  createUrlParser(/^https:\/\/etherscan\.io\/nft\/(0x[a-zA-Z0-9]{40})\/(\d+)$/, "eth", 1, 2),
  createUrlParser(/^https:\/\/gallery\.manifold\.xyz\/?(0x[a-zA-Z0-9]{40})\/(\d+)$/, "eth", 1, 2),
];

export function validateUrl(url: string): boolean {
  return urlParsers.some(parser => parser.validate(url));
}

export function parseUrl(url: string): Nft | null {
  const parser = urlParsers.find(parser => parser.validate(url));
  return parser ? parser.parse(url) : null;
}
