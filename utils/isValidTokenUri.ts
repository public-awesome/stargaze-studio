/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const checkTokenUri = async (tokenUri: string) => {
  const file = await fetch(tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/'))
    .then((res) =>
      res.json().catch((err: any) => {
        throw Error(`Metadata file could not be parsed. Please check that it is valid JSON.`)
      }),
    )
    .catch((err: any) => {
      throw Error(`Unable to fetch metadata from ${tokenUri}`)
    })

  if (!file.image) {
    throw Error('Token URI must contain an image URL.')
  }
  if (file.image && !file.image.startsWith('ipfs://')) {
    throw Error('Metadata file: The corresponding value for image must be an IPFS URL.')
  }
}
