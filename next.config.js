/** @type {import('next').NextConfig} */
const nextConfig = {
	images:{
		domains: ["ipfs.io", "arweave.net", "media-proxy.artblocks.io"]
	},
	experimental:{
		serverActions: true,
	}
}

module.exports = nextConfig
