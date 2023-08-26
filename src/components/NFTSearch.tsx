import { comicNeue } from "@/fonts";
import React, { Suspense, useEffect } from "react";
import { NftId } from "@/types/types";
import _ from "lodash";
import useUrlParser from "@/hooks/useUrlParser";
import { parseUrl, validateUrl } from "@/lib/validNftUrl";
import ZoraNftPreview from "./ZoraNftPreview";
import ManifoldListingPreview from "./ManifoldListingPreview";

export default function NFTSearch() {
  // a useRef for the input field
  const inputRef = React.useRef<HTMLInputElement>(null);
  // latest valid input value
  const [inputValue, setInputValue] = React.useState("");
  // retrieve metadata from Zora API
  const { data: parsedUrl } = useUrlParser(inputValue);

  const validateUrlOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (inputValue !== e.target.value && validateUrl(e.target.value)) {
      setInputValue(e.target.value);
    }
  };

  return (
    <div>
      <div className="w-full join group">
        <input
          ref={inputRef}
          onChange={validateUrlOnChange}
          className="input w-full border-secondary focus:border-white join-item"
          placeholder="Enter NFT URL or contract-address/token-id"
        />
        <button
          className={`
						join-item
						bg-secondary
						hover:bg-fuchsia-200
						hover:text-black
						active:bg-fuchsia-50
						border
						border-secondary
						group-focus:border-white
						text-white
						normal-case
						tracking-wider
						text-md
						${comicNeue.className}`}
        >
          Such NFT wow
        </button>
      </div>
      {parsedUrl?.handlerName === "zora" && (
        <Suspense fallback={<div>Loading...</div>}>
          <ZoraNftPreview
            nft={parsedUrl.params}
            onSave={() => {
              if (!_.isNull(inputRef.current)) {
                inputRef.current.value = "";
              }
              setInputValue("");
            }}
          />
        </Suspense>
      )}
      {parsedUrl?.handlerName === "manifoldListing" && (
        <Suspense fallback={<div>Loading...</div>}>
          <ManifoldListingPreview
						listingId={parsedUrl.params}
            onSave={() => {
              if (!_.isNull(inputRef.current)) {
                inputRef.current.value = "";
              }
              setInputValue("");
            }}
					/>
        </Suspense>
      )}
    </div>
  );
}
