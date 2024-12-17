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
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.svg',
}

export const ibcAtom: TokenInfo = {
  id: 'ibc-atom',
  denom:
    NETWORK === 'mainnet'
      ? 'ibc/9DF365E2C0EF4EA02FA771F638BB9C0C830EFCD354629BDC017F79B348B4E989'
      : 'factory/stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e/uatom',
  displayName: 'ATOM',
  decimalPlaces: 6,
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg',
}

export const ibcUsdc: TokenInfo = {
  id: 'ibc-usdc',
  denom:
    NETWORK === 'mainnet'
      ? 'ibc/4A1C18CA7F50544760CF306189B810CE4C1CB156C7FC870143D401FE7280E591'
      : 'factory/stars1paqkeyluuw47pflgwwqaaj8y679zj96aatg5a7/uusdc',
  displayName: 'USDC',
  decimalPlaces: 6,
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.svg',
}

export const ibcOsmo: TokenInfo = {
  id: 'ibc-osmo',
  denom:
    NETWORK === 'mainnet'
      ? 'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518'
      : 'factory/stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e/uosmo',
  displayName: 'OSMO',
  decimalPlaces: 6,
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg',
}

export const ibcUsk: TokenInfo = {
  id: 'ibc-usk',
  denom:
    NETWORK === 'mainnet'
      ? 'ibc/938CEB62ABCBA6366AA369A8362E310B2A0B1A54835E4F3FF01D69D860959128'
      : 'factory/stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e/uusk',
  displayName: 'USK',
  decimalPlaces: 6,
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.svg',
}

// export const ibcKuji: TokenInfo = {
//   id: 'ibc-kuji',
//   denom:
//     NETWORK === 'mainnet'
//       ? 'ibc/0E57658B71E9CC4BB0F6FE3E01712966713B49E6FD292E6B66E3F111B103D361'
//       : 'factory/stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e/ukuji',
//   displayName: 'KUJI',
//   decimalPlaces: 6,
//   imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.svg',
// }

export const ibcFrnz: TokenInfo = {
  id: 'ibc-frnz',
  denom:
    NETWORK === 'mainnet'
      ? 'ibc/9C40A8368C0E1CAA4144DBDEBBCE2E7A5CC2D128F0A9F785ECB71ECFF575114C'
      : 'factory/stars1paqkeyluuw47pflgwwqaaj8y679zj96aatg5a7/ufrienzies',
  displayName: 'FRNZ',
  decimalPlaces: 6,
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.png',
}

export const ibcNbtc: TokenInfo = {
  id: 'ibc-nBTC',
  denom: NETWORK === 'mainnet' ? 'Not available' : 'factory/stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e/unbtc',
  displayName: 'nBTC',
  decimalPlaces: 6,
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.svg',
}

// export const ibcHuahua: TokenInfo = {
//   id: 'ibc-huahua',
//   denom:
//     NETWORK === 'mainnet'
//       ? 'ibc/CAD8A9F306CAAC55731C66930D6BEE539856DD12E59061C965E44D82AA26A0E7'
//       : 'factory/stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e/uhuahua',
//   displayName: 'HUAHUA',
//   decimalPlaces: 6,
// }

export const ibcCrbrus: TokenInfo = {
  id: 'ibc-crbrus',
  denom:
    NETWORK === 'mainnet'
      ? 'ibc/71CEEB5CC09F75A3ACDC417108C14514351B6B2A540ACE9B37A80BF930845134'
      : 'factory/stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e/uCRBRUS',
  displayName: 'CRBRUS',
  decimalPlaces: 6,
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.svg',
}

export const ibcTia: TokenInfo = {
  id: 'ibc-tia',
  denom:
    NETWORK === 'mainnet'
      ? 'ibc/14D1406D84227FDF4B055EA5CB2298095BBCA3F3BC3EF583AE6DF36F0FB179C8'
      : 'factory/stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e/utia',
  displayName: 'TIA',
  decimalPlaces: 6,
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg',
}

export const nativeStardust: TokenInfo = {
  id: 'native-strdst',
  denom:
    NETWORK === 'mainnet'
      ? 'factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust'
      : 'factory/stars18vxuarvh44wxltxqsyac36972nvaqc377sdh40/dust',
  displayName: 'STRDST',
  decimalPlaces: 6,
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.png',
}

export const nativeBrnch: TokenInfo = {
  id: 'native-brnch',
  denom:
    NETWORK === 'mainnet'
      ? 'factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH'
      : 'factory/stars153w5xhuqu3et29lgqk4dsynj6gjn96lr33wx4e/uBRNCH',
  displayName: 'BRNCH',
  decimalPlaces: 6,
  imageURL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.png',
}

export const tokensList = [
  stars,
  ibcAtom,
  ibcOsmo,
  ibcUsdc,
  ibcUsk,
  ibcFrnz,
  ibcNbtc,
  // ibcKuji,
  // ibcHuahua,
  ibcCrbrus,
  ibcTia,
  nativeStardust,
  nativeBrnch,
]
