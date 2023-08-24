import { useEffect, useState } from "react";
import { validateUrl, parseUrl, handler } from "@/lib/validNftUrl";

export type ZoraParams = { contractAddress: string; tokenId: string };
export type ManifoldParams = number;

export type ParsedUrlResult =
  | { handlerName: "zora"; params: ZoraParams }
  | { handlerName: "manifoldListing"; params: ManifoldParams };


type UrlParserReturn = {
	data: ParsedUrlResult | null;
};

function useUrlParser(url: string): UrlParserReturn {
  const [parsedResult, setParsedResult] = useState<ParsedUrlResult | null>(
    null
  );

  useEffect(() => {
    if (url) {
      const parsedUrl = parseUrl(url);
      const parsedHandler = handler(url);
      if (parsedUrl && parsedHandler) {
        if (parsedHandler === "manifoldListing") {
          setParsedResult({ handlerName: parsedHandler, params: Number(parsedUrl) });
        } else if (parsedHandler === "zora" && parsedUrl) {
          setParsedResult({
            handlerName: parsedHandler,
            params: {
              contractAddress: parsedUrl.contractAddress,
              tokenId: parsedUrl.tokenId,
            },
          });
        }
      }
    }
  }, [url]);

  return {
		data: parsedResult,
	}
}

export default useUrlParser;
