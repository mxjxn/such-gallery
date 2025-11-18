import handleImageUrl from "@/lib/handleImageUrls";

async function tokenURIFetcher(url: string) {
  const imageUrl = handleImageUrl(url);
  if (!imageUrl) return null;
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      // throw an exception if the request was not successful
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Fetch error: ${error}`);
    return null;
  }
}
