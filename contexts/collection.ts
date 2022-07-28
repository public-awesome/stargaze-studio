import create from 'zustand'

export const useCollectionStore = create(() => ({
  name: 'Example',
  base_token_uri: '',
  description: 'Lorem',
  image: 'ipfs://bafybeigi3bwpvyvsmnbj46ra4hyffcxdeaj6ntfk5jpic5mx27x6ih2qvq/images/1.png',
  external_image: '',
  num_tokens: 10,
  per_address_limit: 1,
  start_time: '1650982532000000000',
  symbol: 'EXP',
  unit_price: 50,
  whitelist: '',
}))

export const setName = (value: string) => {
  useCollectionStore.setState({ name: value })
}

export const setBaseTokenUri = (value: string) => {
  useCollectionStore.setState({ base_token_uri: value })
}

export const setDescription = (value: string) => {
  useCollectionStore.setState({ description: value })
}

export const setImage = (value: string) => {
  useCollectionStore.setState({ image: value })
}

export const setExternalImage = (value: string) => {
  useCollectionStore.setState({ external_image: value })
}

export const setNumTokens = (value: number) => {
  useCollectionStore.setState({ num_tokens: value })
}

export const setPerAddressLimit = (value: number) => {
  useCollectionStore.setState({ per_address_limit: value })
}

export const setStartTime = (value: string) => {
  useCollectionStore.setState({ start_time: value })
}

export const setSymbol = (value: string) => {
  useCollectionStore.setState({ symbol: value })
}

export const setUnitPrice = (value: number) => {
  useCollectionStore.setState({ unit_price: value })
}

export const setWhitelist = (value: string) => {
  useCollectionStore.setState({ whitelist: value })
}
