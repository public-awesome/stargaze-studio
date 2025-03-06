import {
  FEATURED_VENDING_FACTORY_ADDRESS,
  FEATURED_VENDING_FACTORY_FLEX_ADDRESS,
  FEATURED_VENDING_FACTORY_MERKLE_TREE_ADDRESS,
  FEATURED_VENDING_FACTORY_MERKLE_TREE_FLEX_ADDRESS,
  FEATURED_VENDING_IBC_INIT_FACTORY_ADDRESS,
  FEATURED_VENDING_IBC_INIT_FACTORY_FLEX_ADDRESS,
  FEATURED_VENDING_IBC_INIT_FACTORY_MERKLE_TREE_ADDRESS,
  FEATURED_VENDING_IBC_INIT_FACTORY_MERKLE_TREE_FLEX_ADDRESS,
  OPEN_EDITION_FACTORY_ADDRESS,
  OPEN_EDITION_FACTORY_FLEX_ADDRESS,
  OPEN_EDITION_IBC_INIT_FACTORY_ADDRESS,
  OPEN_EDITION_IBC_INIT_FACTORY_FLEX_ADDRESS,
  OPEN_EDITION_IBC_INIT_FACTORY_MERKLE_TREE_ADDRESS,
  OPEN_EDITION_IBC_INIT_FACTORY_MERKLE_TREE_FLEX_ADDRESS,
  OPEN_EDITION_MERKLE_TREE_FACTORY_ADDRESS,
  OPEN_EDITION_MERKLE_TREE_FLEX_FACTORY_ADDRESS,
  OPEN_EDITION_UPDATABLE_FACTORY_ADDRESS,
  OPEN_EDITION_UPDATABLE_IBC_INIT_FACTORY_ADDRESS,
  VENDING_FACTORY_ADDRESS,
  VENDING_FACTORY_FLEX_ADDRESS,
  VENDING_FACTORY_MERKLE_TREE_ADDRESS,
  VENDING_FACTORY_MERKLE_TREE_FLEX_ADDRESS,
  VENDING_FACTORY_UPDATABLE_ADDRESS,
  VENDING_FACTORY_UPDATABLE_FLEX_ADDRESS,
  VENDING_IBC_INIT_FACTORY_ADDRESS,
  VENDING_IBC_INIT_FACTORY_FLEX_ADDRESS,
  VENDING_IBC_INIT_FACTORY_MERKLE_TREE_ADDRESS,
  VENDING_IBC_INIT_FACTORY_MERKLE_TREE_FLEX_ADDRESS,
  VENDING_IBC_INIT_UPDATABLE_FACTORY_ADDRESS,
  VENDING_IBC_INIT_UPDATABLE_FACTORY_FLEX_ADDRESS,
} from 'utils/constants'

import type { TokenInfo } from './token'
import { gaze, ibcInit } from './token'

export interface MinterInfo {
  id: string
  factoryAddress: string
  supportedToken: TokenInfo
  updatable?: boolean
  flexible?: boolean
  merkleTree?: boolean
  featured?: boolean
}

export const openEditionGazeMinter: MinterInfo = {
  id: 'open-edition-gaze-minter',
  factoryAddress: OPEN_EDITION_FACTORY_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  featured: false,
  flexible: false,
  merkleTree: false,
}

export const openEditionGazeMerkleTreeMinter: MinterInfo = {
  id: 'open-edition-gaze-merkle-tree-minter',
  factoryAddress: OPEN_EDITION_MERKLE_TREE_FACTORY_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  featured: false,
  flexible: false,
  merkleTree: true,
}

export const openEditionUpdatableGazeMinter: MinterInfo = {
  id: 'open-edition-updatable-gaze-minter',
  factoryAddress: OPEN_EDITION_UPDATABLE_FACTORY_ADDRESS,
  supportedToken: gaze,
  updatable: true,
  featured: false,
  flexible: false,
  merkleTree: false,
}

export const openEditionIbcInitMinter: MinterInfo = {
  id: 'open-edition-ibc-init-minter',
  factoryAddress: OPEN_EDITION_IBC_INIT_FACTORY_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  featured: false,
  flexible: false,
  merkleTree: false,
}

export const openEditionIbcInitMerkleTreeMinter: MinterInfo = {
  id: 'open-edition-ibc-init-merkle-tree-minter',
  factoryAddress: OPEN_EDITION_IBC_INIT_FACTORY_MERKLE_TREE_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  featured: false,
  flexible: false,
  merkleTree: true,
}

export const openEditionUpdatableIbcInitMinter: MinterInfo = {
  id: 'open-edition-updatable-ibc-init-minter',
  factoryAddress: OPEN_EDITION_UPDATABLE_IBC_INIT_FACTORY_ADDRESS,
  supportedToken: ibcInit,
  updatable: true,
  featured: false,
  flexible: false,
  merkleTree: false,
}

export const openEditionMinterList = [
  openEditionGazeMinter,
  openEditionGazeMerkleTreeMinter,
  openEditionUpdatableGazeMinter,
  openEditionUpdatableIbcInitMinter,
  openEditionIbcInitMinter,
  openEditionIbcInitMerkleTreeMinter,
]

export const flexibleOpenEditionGazeMinter: MinterInfo = {
  id: 'flexible-open-edition-gaze-minter',
  factoryAddress: OPEN_EDITION_FACTORY_FLEX_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  featured: false,
  flexible: true,
  merkleTree: false,
}

export const flexibleOpenEditionGazeMerkleTreeMinter: MinterInfo = {
  id: 'flexible-open-edition-gaze-merkle-tree-minter',
  factoryAddress: OPEN_EDITION_MERKLE_TREE_FLEX_FACTORY_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  featured: false,
  flexible: true,
  merkleTree: true,
}

export const flexibleOpenEditionIbcInitMinter: MinterInfo = {
  id: 'flexible-open-edition-ibc-init-minter',
  factoryAddress: OPEN_EDITION_IBC_INIT_FACTORY_FLEX_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  featured: false,
  flexible: true,
  merkleTree: false,
}

export const flexibleOpenEditionIbcInitMerkleTreeMinter: MinterInfo = {
  id: 'flexible-open-edition-ibc-init-merkle-tree-minter',
  factoryAddress: OPEN_EDITION_IBC_INIT_FACTORY_MERKLE_TREE_FLEX_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  featured: false,
  flexible: true,
  merkleTree: true,
}

export const flexibleOpenEditionMinterList = [
  flexibleOpenEditionGazeMinter,
  flexibleOpenEditionGazeMerkleTreeMinter,
  flexibleOpenEditionIbcInitMinter,
  flexibleOpenEditionIbcInitMerkleTreeMinter,
]

export const vendingGazeMinter: MinterInfo = {
  id: 'vending-gaze-minter',
  factoryAddress: VENDING_FACTORY_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  flexible: false,
  merkleTree: false,
  featured: false,
}

export const vendingFeaturedGazeMinter: MinterInfo = {
  id: 'vending-gaze-minter',
  factoryAddress: FEATURED_VENDING_FACTORY_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  flexible: false,
  merkleTree: false,
  featured: true,
}

export const vendingUpdatableGazeMinter: MinterInfo = {
  id: 'vending-updatable-gaze-minter',
  factoryAddress: VENDING_FACTORY_UPDATABLE_ADDRESS,
  supportedToken: gaze,
  updatable: true,
  flexible: false,
  merkleTree: false,
  featured: false,
}

export const vendingIbcInitMinter: MinterInfo = {
  id: 'vending-ibc-init-minter',
  factoryAddress: VENDING_IBC_INIT_FACTORY_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  flexible: false,
  merkleTree: false,
  featured: false,
}

export const vendingFeaturedIbcInitMinter: MinterInfo = {
  id: 'vending-featured-ibc-init-minter',
  factoryAddress: FEATURED_VENDING_IBC_INIT_FACTORY_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  flexible: false,
  merkleTree: false,
  featured: true,
}

export const vendingUpdatableIbcInitMinter: MinterInfo = {
  id: 'vending-updatable-ibc-init-minter',
  factoryAddress: VENDING_IBC_INIT_UPDATABLE_FACTORY_ADDRESS,
  supportedToken: ibcInit,
  updatable: true,
  flexible: false,
  merkleTree: false,
  featured: false,
}

export const vendingMinterList = [
  vendingGazeMinter,
  vendingFeaturedGazeMinter,
  vendingUpdatableGazeMinter,
  vendingIbcInitMinter,
  vendingFeaturedIbcInitMinter,
  vendingUpdatableIbcInitMinter,
]

export const flexibleVendingGazeMinter: MinterInfo = {
  id: 'flexible-vending-gaze-minter',
  factoryAddress: VENDING_FACTORY_FLEX_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  flexible: true,
  merkleTree: false,
  featured: false,
}

export const flexibleFeaturedVendingGazeMinter: MinterInfo = {
  id: 'flexible-vending-gaze-minter',
  factoryAddress: FEATURED_VENDING_FACTORY_FLEX_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  flexible: true,
  merkleTree: false,
  featured: true,
}

export const flexibleVendingUpdatableGazeMinter: MinterInfo = {
  id: 'flexible-vending-updatable-gaze-minter',
  factoryAddress: VENDING_FACTORY_UPDATABLE_FLEX_ADDRESS,
  supportedToken: gaze,
  updatable: true,
  flexible: true,
  merkleTree: false,
  featured: false,
}

export const flexibleVendingIbcInitMinter: MinterInfo = {
  id: 'flexible-vending-ibc-init-minter',
  factoryAddress: VENDING_IBC_INIT_FACTORY_FLEX_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  flexible: true,
  merkleTree: false,
  featured: false,
}

export const flexibleFeaturedVendingIbcInitMinter: MinterInfo = {
  id: 'flexible-featured-vending-ibc-init-minter',
  factoryAddress: FEATURED_VENDING_IBC_INIT_FACTORY_FLEX_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  flexible: true,
  merkleTree: false,
  featured: true,
}

export const flexibleVendingUpdatableIbcInitMinter: MinterInfo = {
  id: 'flexible-vending-updatable-ibc-init-minter',
  factoryAddress: VENDING_IBC_INIT_UPDATABLE_FACTORY_FLEX_ADDRESS,
  supportedToken: ibcInit,
  updatable: true,
  flexible: true,
  merkleTree: false,
  featured: false,
}

export const flexibleVendingMinterList = [
  flexibleVendingGazeMinter,
  flexibleFeaturedVendingGazeMinter,
  flexibleVendingUpdatableGazeMinter,
  flexibleVendingIbcInitMinter,
  flexibleFeaturedVendingIbcInitMinter,
  flexibleVendingUpdatableIbcInitMinter,
]

export const merkleTreeVendingGazeMinter: MinterInfo = {
  id: 'merkletree-vending-gaze-minter',
  factoryAddress: VENDING_FACTORY_MERKLE_TREE_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  flexible: false,
  merkleTree: true,
  featured: false,
}

export const merkleTreeVendingFeaturedGazeMinter: MinterInfo = {
  id: 'merkletree-vending-featured-gaze-minter',
  factoryAddress: FEATURED_VENDING_FACTORY_MERKLE_TREE_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  flexible: false,
  merkleTree: true,
  featured: true,
}

export const merkleTreeVendingIbcInitMinter: MinterInfo = {
  id: 'merkletree-vending-ibc-init-minter',
  factoryAddress: VENDING_IBC_INIT_FACTORY_MERKLE_TREE_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  flexible: false,
  merkleTree: true,
  featured: false,
}

export const merkleTreeVendingFeaturedIbcInitMinter: MinterInfo = {
  id: 'merkletree-vending-featured-ibc-init-minter',
  factoryAddress: FEATURED_VENDING_IBC_INIT_FACTORY_MERKLE_TREE_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  flexible: false,
  merkleTree: true,
  featured: true,
}

export const merkleTreeFlexVendingGazeMinter: MinterInfo = {
  id: 'merkletree-flex-vending-gaze-minter',
  factoryAddress: VENDING_FACTORY_MERKLE_TREE_FLEX_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  flexible: true,
  merkleTree: true,
  featured: false,
}

export const merkleTreeFlexVendingFeaturedGazeMinter: MinterInfo = {
  id: 'merkletree-flex-vending-featured-gaze-minter',
  factoryAddress: FEATURED_VENDING_FACTORY_MERKLE_TREE_FLEX_ADDRESS,
  supportedToken: gaze,
  updatable: false,
  flexible: true,
  merkleTree: true,
  featured: true,
}

export const merkleTreeFlexVendingIbcInitMinter: MinterInfo = {
  id: 'merkletree-flex-vending-ibc-init-minter',
  factoryAddress: VENDING_IBC_INIT_FACTORY_MERKLE_TREE_FLEX_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  flexible: true,
  merkleTree: true,
  featured: false,
}

export const merkleTreeFlexVendingFeaturedIbcInitMinter: MinterInfo = {
  id: 'merkletree-flex-vending-featured-ibc-INIT-minter',
  factoryAddress: FEATURED_VENDING_IBC_INIT_FACTORY_MERKLE_TREE_FLEX_ADDRESS,
  supportedToken: ibcInit,
  updatable: false,
  flexible: true,
  merkleTree: true,
  featured: true,
}

export const merkleTreeVendingMinterList = [
  merkleTreeVendingGazeMinter,
  merkleTreeVendingIbcInitMinter,
  merkleTreeVendingFeaturedIbcInitMinter,
  merkleTreeVendingFeaturedGazeMinter,
  merkleTreeFlexVendingGazeMinter,
  merkleTreeFlexVendingFeaturedGazeMinter,
  merkleTreeFlexVendingIbcInitMinter,
  merkleTreeFlexVendingFeaturedIbcInitMinter,
]
