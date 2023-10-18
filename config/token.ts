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
      ? 'ibc/4A1C18CA7F50544760CF306189B810CE4C1CB156C7FC870143D401FE7280E591'
      : 'factory/stars1paqkeyluuw47pflgwwqaaj8y679zj96aatg5a7/uusdc',
  displayName: 'USDC',
  decimalPlaces: 6,
}
export const ibcUsk: TokenInfo = {
  id: 'ibc-usk',
  denom:
    NETWORK === 'mainnet' ? 'ibc/938CEB62ABCBA6366AA369A8362E310B2A0B1A54835E4F3FF01D69D860959128' : 'Not available',
  displayName: 'USK',
  decimalPlaces: 6,
}

export const ibcFrnz: TokenInfo = {
  id: 'ibc-frnz',
  denom:
    NETWORK === 'mainnet'
      ? 'ibc/9C40A8368C0E1CAA4144DBDEBBCE2E7A5CC2D128F0A9F785ECB71ECFF575114C'
      : 'factory/stars1paqkeyluuw47pflgwwqaaj8y679zj96aatg5a7/ufrienzies',
  displayName: 'FRNZ',
  decimalPlaces: 6,
}

export const nativeStardust: TokenInfo = {
  id: 'native-strdst',
  denom:
    NETWORK === 'mainnet'
      ? 'factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust'
      : 'factory/stars18vxuarvh44wxltxqsyac36972nvaqc377sdh40/dust',
  displayName: 'STRDST',
  decimalPlaces: 6,
}

export const tokensList = [stars, ibcAtom, ibcUsdc, ibcFrnz, nativeStardust]
