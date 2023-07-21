export default function handleImageUrl(url) {
	console.log("$$$")
	console.log(url)
  if (url.split(":")[0] === "https" || url.split(":")[0] === "http") {
		return url
  } else if (url.split(":")[0] === "ipfs") {
		return "https://ipfs.io/ipfs/" + url.slice(7);
	}
}
