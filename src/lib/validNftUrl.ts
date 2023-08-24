import { NftId } from "@/types/types";

interface IUrlParser {
  validate: (url: string) => boolean;
  parse: (url: string) => any;
  handle: string;
}

// Generic function to create a validator and a parser
function createNftIdParser(
  regex: RegExp,
  chain: string,
  contractIdx: number,
  tokenIdIdx: number,
  handler: string,
): IUrlParser {
  return {
		handle: handler,
    validate: (url: string) => regex.test(url),
    parse: (url: string) => {
      const result = regex.exec(url);
      return result
        ? {
            chain,
            contractAddress: result[contractIdx],
            tokenId: result[tokenIdIdx],
          }
        : null;
    },
  };
}

function createListingIdParser(
  regex: RegExp,
  listingIdIdx: number,
  handler: string,
):IUrlParser {
	return {
		handle: handler,

		validate: (url: string) => regex.test(url),
		parse: (url: string) => {
			const result = regex.exec(url);
			return result
			  ? Number(result[listingIdIdx])
				: null;
		},
	}

}
const urlParsers: IUrlParser[] = [
  createNftIdParser(
    /^https?:\/\/(www\.)?artblocks\.io\/.*\/(0x[a-fA-F0-9]{40})\/\d+\/tokens\/(\d+)$/,
    "1",
    2,
    3,
		"zora"
  ),
  createNftIdParser(
    /^https:\/\/opensea\.io\/assets\/(\w+)\/([a-zA-Z0-9]+)\/(\d+)$/,
    "1",
    2,
    3,
		"zora"
  ),
  createNftIdParser(
    /^https:\/\/zora\.co\/(\w+)\/eth:(0x[a-fA-F0-9]{40})\/(\d+)$/,
    "1",
    2,
    3,
		"zora"
  ),
  createNftIdParser(
    /^https:\/\/etherscan\.io\/nft\/(0x[a-zA-Z0-9]{40})\/(\d+)$/,
    "1",
    1,
    2,
		"zora"
  ),
  createNftIdParser(
    /^https:\/\/gallery\.manifold\.xyz\/?(0x[a-zA-Z0-9]{40})\/(\d+)$/,
    "1",
    1,
    2,
		"zora"
  ),
	createListingIdParser(
		/^https:\/\/gallery\.manifold\.xyz\/listing\?listingId\=(\d+)$/,
		1,
		"manifoldListing"
	)
];

export function validateUrl(url: string): boolean {
  return urlParsers.some((parser) => parser.validate(url));
}

export function parseUrl(url: string): NftId | null {
  const parser = urlParsers.find((parser) => parser.validate(url));
  return parser ? parser.parse(url) : null;
}

export function handler(url: string):string {
  const parser = urlParsers.find(parser => parser.validate(url));
  if (parser) {
    const id = parser.parse(url);
    if (id) {
      return parser.handle
    }
  }
  throw new Error("Failed to process URL");
}

