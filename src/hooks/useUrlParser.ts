import { useEffect, useState } from "react";
import {
  validateUrl,
  parseUrl,
  handler,
  ZoraHandler,
  ManifoldListingHandler,
} from "@/lib/validNftUrl";

export type UrlParserResult = ManifoldListingHandler | ZoraHandler | null;

function urlParser(url: string): UrlParserResult {
  let data: UrlParserResult = null;
  console.log("url", url);
  if (url) {
    const parsedUrl = parseUrl(url);
    console.log({ parsedUrl });
    const parsedHandler = handler(url);
    console.log({ parsedUrl });
    if (
      parsedUrl?.tokenId &&
      parsedUrl.contractAddress &&
      parsedHandler &&
      parsedHandler === "zora"
    ) {
      data = {
        handlerName: parsedHandler,
        params: {
          contractAddress: parsedUrl.contractAddress,
          tokenId: parsedUrl.tokenId,
        },
      };
    } else if (parsedHandler === "manifoldListing") {
      data = { handlerName: parsedHandler, params: Number(parsedUrl) };
    }
  }

  return data;
}

export default urlParser;
