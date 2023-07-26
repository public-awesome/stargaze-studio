export interface TokenInfo {
  id: string
  denom: string
  displayName: string
  decimalPlaces: number
  imageURL?: string
  symbol?: string
}

export const ibcAtom: TokenInfo = {
  id: 'ibc-atom',
  denom: 'ibc/',
  displayName: 'ATOM',
  decimalPlaces: 6,
}

export const stars: TokenInfo = {
  id: 'stars',
  denom: 'ustars',
  displayName: 'STARS',
  decimalPlaces: 6,
}
