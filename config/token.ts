export interface TokenInfo {
  id: string
  denom: string
  displayName: string
  decimalPlaces: number
  imageURL?: string
  symbol?: string
}

export const stars: TokenInfo = {
  id: 'stars',
  denom: 'ustars',
  displayName: 'STARS',
  decimalPlaces: 6,
}

export const ibcAtom: TokenInfo = {
  id: 'ibc-atom',
  denom: 'ibc/atom',
  displayName: 'ATOM',
  decimalPlaces: 6,
}

export const ibcUsdc: TokenInfo = {
  id: 'ibc-usdc',
  denom: 'ibc/usdc',
  displayName: 'USDC',
  decimalPlaces: 6,
}

export const ibcFrenz: TokenInfo = {
  id: 'ibc-frenz',
  denom: 'ibc/frenz',
  displayName: 'FRENZ',
  decimalPlaces: 6,
}

export const tokensList = [stars, ibcAtom, ibcUsdc, ibcFrenz]
