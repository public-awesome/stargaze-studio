import { NETWORK } from 'utils/constants'

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
  denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
  displayName: 'ATOM',
  decimalPlaces: 6,
}

export const ibcUsdc: TokenInfo = {
  id: 'ibc-usdc',
  denom:
    NETWORK === 'mainnet'
      ? 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858'
      : 'factory/stars1s8qx0zvz8yd6e4x0mqmqf7fr9vvfn622wtp3g3/uusdc',
  displayName: 'USDC',
  decimalPlaces: 6,
}

export const ibcFrnz: TokenInfo = {
  id: 'ibc-frnz',
  denom:
    NETWORK === 'mainnet'
      ? 'ibc/7FA7EC64490E3BDE5A1A28CBE73CC0AD22522794957BC891C46321E3A6074DB9'
      : 'factory/stars10w5eulj60qp3cfqa0hkmke78qdy2feq6x9xdmd/ufrnz',
  displayName: 'FRNZ',
  decimalPlaces: 6,
}

export const tokensList = [stars, ibcAtom, ibcUsdc, ibcFrnz]
