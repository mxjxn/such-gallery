export function validateOpenseaNftUrl(url: string): boolean {
    const pattern = new RegExp('(http|https):\/\/(.*?)\/(ethereum|polygon|optimism)\/(.*?)\/(.*?)', 'g');
    return pattern.test(url);
}

export function validateZoraUrl(url: string): boolean {
  const regex = /^https:\/\/zora\.co\/(\w+)\/eth:([a-zA-Z0-9]+)\/(\d+)$/g;
  return regex.test(url);
}

export function validateOpenSeaUrl(url: string): boolean {
  const regex = /^https:\/\/opensea\.io\/assets\/(\w+)\/([a-zA-Z0-9]+)\/(\d+)$/g;
  return regex.test(url);
}

export function validateEtherscanUrl(url: string): boolean {
  const regex = /^https:\/\/etherscan\.io\/nft\/([a-zA-Z0-9]+)\/(\d+)$/g;
  return regex.test(url);
}

export function validateManifoldUrl(url: string): boolean {
  const regex = /^https:\/\/gallery\.manifold\.xyz\/((\w+\/)?)(([a-zA-Z0-9]+)\/\d+)$/g;
  return regex.test(url);
}

