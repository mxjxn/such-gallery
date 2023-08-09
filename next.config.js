/** @type {import('next').NextConfig} */
const nextConfig = {
	images:{
		domains: ["ipfs.io", "arweave.net", "media-proxy.artblocks.io", "gateway.pinata.cloud"]
	},
	experimental:{
		serverActions: true,
	}
}

module.exports = nextConfig
