import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNftsByUser } from "@/app/nfts";

export default function NftList({ address }) {
	const { data, isLoading } = useQuery(["userNfts", address], async () => getNftsByUser(address));
	useEffect(() => {
		console.log({ data })
	}, [data]);
	return (
		<div
			className="bg-gradient-to-b to-gray-950 from-gray-900 text-gray-100 flex flex-col"
		>

		</div>
	)
}
