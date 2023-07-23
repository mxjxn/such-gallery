import {
  parseEtherscanUrl,
  parseManifoldUrl,
  parseOpenSeaUrl,
  parseZoraUrl,
} from "@/lib/parseNftUrl";
import { Nft } from "@/types/types";

interface IUrlParser {
  validateFunc: (url: string) => boolean;
  parseFunc: (url: string) => Nft;
}

export function validateOpenseaNftUrl(url: string): boolean {
    const pattern = new RegExp('(http|https):\/\/(.*?)\/(ethereum|polygon|optimism)\/(.*?)\/(.*?)', 'g');
    return pattern.test(url);
}

export function validateZoraUrl(url: string): boolean {
  const regex = /^https:\/\/zora\.co\/(\w+)\/eth:(0x[a-fA-F0-9]{40})\/(\d+)$/g;
  return regex.test(url);
}

export function validateOpenSeaUrl(url: string): boolean {
  const regex = /^https:\/\/opensea\.io\/assets\/(\w+)\/([a-zA-Z0-9]+)\/(\d+)$/g;
  return regex.test(url);
}

export function validateEtherscanUrl(url: string): boolean {
  const regex = /^https:\/\/etherscan\.io\/nft\/(0x[a-zA-Z0-9]{40})\/(\d+)$/g;
  return regex.test(url);
}

export function validateManifoldUrl(url: string): boolean {
  const regex = /^https:\/\/gallery\.manifold\.xyz\/((\w+\/)?)((0x[a-fA-F0-9]{40})\/\d+)$/g;
  return regex.test(url);
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

export function validUrlParser (url: string) {
	let valid = false;
	let parsedUrl = null;
	urlParsers.forEach( parser => {
		if (parser.validateFunc(url)) {
			valid = true;
			parsedUrl = parser.parseFunc(url)
		}
	});
	return [valid, parsedUrl];
}
