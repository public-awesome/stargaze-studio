import {
  OPEN_EDITION_FACTORY_ADDRESS,
  OPEN_EDITION_IBC_ATOM_FACTORY_ADDRESS,
  OPEN_EDITION_IBC_FRENZ_FACTORY_ADDRESS,
  OPEN_EDITION_IBC_USDC_FACTORY_ADDRESS,
  OPEN_EDITION_UPDATABLE_FACTORY_ADDRESS,
  OPEN_EDITION_UPDATABLE_IBC_ATOM_FACTORY_ADDRESS,
  OPEN_EDITION_UPDATABLE_IBC_FRENZ_FACTORY_ADDRESS,
  OPEN_EDITION_UPDATABLE_IBC_USDC_FACTORY_ADDRESS,
} from 'utils/constants'

import type { TokenInfo } from './token'
import { ibcAtom, ibcFrenz, ibcUsdc, stars } from './token'

export interface MinterInfo {
  id: string
  factoryAddress: string
  supportedToken: TokenInfo
  updatable?: boolean
}

export const openEditionStarsMinter: MinterInfo = {
  id: 'open-edition-stars-minter',
  factoryAddress: OPEN_EDITION_FACTORY_ADDRESS,
  supportedToken: stars,
  updatable: false,
}

export const openEditionUpdatableStarsMinter: MinterInfo = {
  id: 'open-edition-updatable-stars-minter',
  factoryAddress: OPEN_EDITION_UPDATABLE_FACTORY_ADDRESS,
  supportedToken: stars,
  updatable: true,
}

export const openEditionIbcAtomMinter: MinterInfo = {
  id: 'open-edition-ibc-atom-minter',
  factoryAddress: OPEN_EDITION_IBC_ATOM_FACTORY_ADDRESS,
  supportedToken: ibcAtom,
  updatable: false,
}

export const openEditionUpdatableIbcAtomMinter: MinterInfo = {
  id: 'open-edition-updatable-ibc-atom-minter',
  factoryAddress: OPEN_EDITION_UPDATABLE_IBC_ATOM_FACTORY_ADDRESS,
  supportedToken: ibcAtom,
  updatable: true,
}

export const openEditionIbcUsdcMinter: MinterInfo = {
  id: 'open-edition-ibc-usdc-minter',
  factoryAddress: OPEN_EDITION_IBC_USDC_FACTORY_ADDRESS,
  supportedToken: ibcUsdc,
  updatable: false,
}

export const openEditionUpdatableIbcUsdcMinter: MinterInfo = {
  id: 'open-edition-updatable-ibc-usdc-minter',
  factoryAddress: OPEN_EDITION_UPDATABLE_IBC_USDC_FACTORY_ADDRESS,
  supportedToken: ibcUsdc,
  updatable: true,
}

export const openEditionIbcFrenzMinter: MinterInfo = {
  id: 'open-edition-ibc-frenz-minter',
  factoryAddress: OPEN_EDITION_IBC_FRENZ_FACTORY_ADDRESS,
  supportedToken: ibcFrenz,
  updatable: false,
}

export const openEditionUpdatableIbcFrenzMinter: MinterInfo = {
  id: 'open-edition-updatable-ibc-frenz-minter',
  factoryAddress: OPEN_EDITION_UPDATABLE_IBC_FRENZ_FACTORY_ADDRESS,
  supportedToken: ibcFrenz,
  updatable: true,
}

export const openEditionMinterList = [
  openEditionStarsMinter,
  openEditionUpdatableStarsMinter,
  openEditionUpdatableIbcAtomMinter,
  openEditionIbcAtomMinter,
  openEditionIbcFrenzMinter,
  openEditionUpdatableIbcFrenzMinter,
  openEditionIbcUsdcMinter,
  openEditionUpdatableIbcUsdcMinter,
]
