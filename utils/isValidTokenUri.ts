/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
export const checkTokenUri = async (tokenUri: string, isBaseTokenUri?: boolean) => {
  if (isBaseTokenUri) {
    await fetch(tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/').concat(tokenUri.endsWith('/') ? '1' : '/1'))
      .then((res) =>
        res
          .json()
          .then((data) => {
            if (!data.image) {
              throw Error('Metadata validation failed. The metadata files must contain an image URL.')
            }
            if (!data.image.startsWith('ipfs://')) {
              throw Error('Metadata file validation failed: The corresponding value for image must be an IPFS URL.')
            }
          })
          .catch(() => {
            throw Error(
              `Metadata validation failed. Please check that the metadata files in the IPFS folder are valid JSON.`,
            )
          }),
      )
      .catch(async () => {
        await fetch(
          tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/').concat(tokenUri.endsWith('/') ? '1.json' : '/1.json'),
        )
          .then((response) =>
            response
              .json()
              .then((file) => {
                if (!file.image) {
                  throw Error('Metadata validation failed. The metadata files must contain an image URL.')
                }
                if (!file.image.startsWith('ipfs://')) {
                  throw Error('Metadata file validation failed: The corresponding value for image must be an IPFS URL.')
                }
              })
              .catch(() => {
                throw Error(
                  `Metadata validation failed. Please check that the metadata files in the IPFS folder are valid JSON.`,
                )
              }),
          )
          .catch(() => {
            throw Error(
              `Unable to fetch metadata from ${tokenUri}. Metadata validation failed. Please check that the base token URI points to an IPFS folder with metadata files in it.`,
            )
          })
      })
  } else {
    await fetch(tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/'))
      .then((res) =>
        res
          .json()
          .then((file) => {
            if (!file.image) {
              throw Error('Token URI must contain an image URL.')
            }
            if (!file.image.startsWith('ipfs://')) {
              throw Error('Metadata file: The corresponding value for image must be an IPFS URL.')
            }
          })
          .catch(() => {
            throw Error(`Metadata file could not be parsed. Please check that it is valid JSON.`)
          }),
      )
      .catch(() => {
        throw Error(`Unable to fetch metadata from ${tokenUri}`)
      })
  }
}
