import { useEffect, useState } from "react";
import {
  validateEtherscanUrl,
  validateManifoldUrl,
  validateOpenseaNftUrl,
  validateZoraUrl,
} from "@/lib/validNftUrl";
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

// Update your hook
export const useValidateNftUrl = () => {
  const [url, setUrl] = useState<string>("");
  const [isUrlValid, setIsUrlValid] = useState<boolean>(false);
  const [nft, setNft] = useState<Nft | null>(null);

  // Create an array of parsers with their corresponding validation function
  // Continue by adding additional parsers to this array
  useEffect(() => {
    let foundValidUrl = false;

    urlParsers.forEach((parser) => {
      if (parser.validateFunc(url)) {
        setIsUrlValid(true);
        setNft(parser.parseFunc(url));
        foundValidUrl = true;
        return;
      }
    });

    if (!foundValidUrl) {
      setIsUrlValid(false);
      setNft(null);
    }
    // Make sure to re-check when URL or parsers change
  }, [url]);

  return { url, setUrl, isUrlValid, nft };
};
