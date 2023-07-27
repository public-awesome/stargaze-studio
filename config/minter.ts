import {
  OPEN_EDITION_FACTORY_ADDRESS,
  OPEN_EDITION_IBC_ATOM_FACTORY_ADDRESS,
  OPEN_EDITION_IBC_FRENZ_FACTORY_ADDRESS,
} from 'utils/constants'

import type { TokenInfo } from './token'
import { ibcAtom, ibcFrenz, stars } from './token'

export interface MinterInfo {
  id: string
  factoryAddress: string
  supportedToken: TokenInfo
}

export const openEditionStarsMinter: MinterInfo = {
  id: 'open-edition-stars-minter',
  factoryAddress: OPEN_EDITION_FACTORY_ADDRESS,
  supportedToken: stars,
}

export const openEditionIbcAtomMinter: MinterInfo = {
  id: 'open-edition-ibc-atom-minter',
  factoryAddress: OPEN_EDITION_IBC_ATOM_FACTORY_ADDRESS,
  supportedToken: ibcAtom,
}

export const openEditionIbcFrenzMinter: MinterInfo = {
  id: 'open-edition-ibc-frenz-minter',
  factoryAddress: OPEN_EDITION_IBC_FRENZ_FACTORY_ADDRESS,
  supportedToken: ibcFrenz,
}

export const minterList = [openEditionStarsMinter, openEditionIbcAtomMinter, openEditionIbcFrenzMinter]
