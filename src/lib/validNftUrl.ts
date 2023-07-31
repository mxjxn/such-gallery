import { Nft } from "@/types/types";

interface IUrlParser {
  validateFunc: (url: string) => boolean;
  parseFunc: (url: string) => Nft | null;
}

// artblocks regex
const artBlocksRegex =
  /^https?:\/\/(www\.)?artblocks\.io\/.*\/(0x[a-fA-F0-9]{40})\/\d+\/tokens\/(\d+)$/;
// artblocks Validator
export function validateArtBlocksUrl(url: string): boolean {
  artBlocksRegex.lastIndex = 0;
  return artBlocksRegex.test(url);
}
// artblocks Parser
export function parseArtBlocksUrl(url: string): Nft | null {
  const result = artBlocksRegex.exec(url);
  return result
    ? { chain: "eth", contractAddress: result[2], tokenId: result[3] }
    : null;
}

// opensea regex
const openseaRegex =
  /^https:\/\/opensea\.io\/assets\/(\w+)\/([a-zA-Z0-9]+)\/(\d+)$/;
// opensea Validator
export function validateOpenseaNftUrl(url: string): boolean {
  openseaRegex.lastIndex = 0;
  return openseaRegex.test(url);
}
// opensea Parser
export function parseOpenSeaUrl(url: string): Nft | null {
  const result = openseaRegex.exec(url);
  return result
    ? { chain: result[1], contractAddress: result[2], tokenId: result[3] }
    : null;
}

// zora regex
const zoraRegex =
  /^https:\/\/zora\.co\/(\w+)\/eth:(0x[a-fA-F0-9]{40})\/(\d+)$/;
// zora Validator
export function validateZoraUrl(url: string): boolean {
  zoraRegex.lastIndex = 0;
  return zoraRegex.test(url);
}
// zora Parser
export function parseZoraUrl(url: string): Nft | null {
  const result = zoraRegex.exec(url);
  return result
    ? { chain: "eth", contractAddress: result[2], tokenId: result[3] }
    : null;
}

const etherscanRegex =
  /^https:\/\/etherscan\.io\/nft\/(0x[a-zA-Z0-9]{40})\/(\d+)$/;
export function parseEtherscanUrl(url: string): Nft | null {
  const result = etherscanRegex.exec(url);
  return result
    ? { chain: "eth", contractAddress: result[1], tokenId: result[2] }
    : null;
}
export function validateEtherscanUrl(url: string): boolean {
  etherscanRegex.lastIndex = 0;
  return etherscanRegex.test(url);
}

const manifoldRegex =
  /^https:\/\/gallery\.manifold\.xyz\/((\w+\/)?)(([a-zA-Z0-9]{40})\/(\d+))$/;
export function parseManifoldUrl(url: string): Nft | null {
  const result = manifoldRegex.exec(url);
  if (result) {
    let chain = "eth";
    if (result[2]) {
      chain = result[2].slice(0, -1);
    }
    return { chain, contractAddress: result[4], tokenId: result[5] };
  }
  return null;
}
export function validateManifoldUrl(url: string): boolean {
  manifoldRegex.lastIndex = 0;
  return manifoldRegex.test(url);
}

const urlParsers: IUrlParser[] = [
  {
    validateFunc: validateOpenseaNftUrl,
    parseFunc: parseOpenSeaUrl,
  },
  {
    validateFunc: validateZoraUrl,
    parseFunc: parseZoraUrl,
  },
  {
    validateFunc: validateManifoldUrl,
    parseFunc: parseManifoldUrl,
  },
  {
    validateFunc: validateEtherscanUrl,
    parseFunc: parseEtherscanUrl,
  },
];

export function validUrlParser(url: string) {
  let valid = false;
  let parsedUrl = null;
  urlParsers.forEach((parser) => {
		console.log({ valid:parser.validateFunc(url), parsed: parser.parseFunc(url) })
		console.log()
    if (parser.validateFunc(url)) {
      valid = true;
      parsedUrl = parser.parseFunc(url);
			console.log(parsedUrl)
    }
  });
  return [valid, parsedUrl];
}
