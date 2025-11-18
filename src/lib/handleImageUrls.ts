export default function handleImageUrl(url: string | undefined | null) {
  if (!url) {
    return "";
  }
  if (url.split(":")[0] === "https" || url.split(":")[0] === "http") {
    return url;
  } else if (url.split(":")[0] === "ipfs") {
    return "https://ipfs.io/ipfs/" + url.slice(7);
  } else if (url[0] === "Q") {
    return "https://ipfs.io/ipfs/" + url;
  }
  return "";
}
