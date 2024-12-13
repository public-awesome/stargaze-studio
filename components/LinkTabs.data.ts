import type { LinkTabProps } from './LinkTab'

export const sg721LinkTabs: LinkTabProps[] = [
  {
    title: 'Query',
    description: `Dispatch queries with your SG721 contract`,
    href: '/contracts/sg721/query',
  },
  {
    title: 'Execute',
    description: `Execute SG721 contract actions`,
    href: '/contracts/sg721/execute',
  },
  {
    title: 'Migrate',
    description: `Migrate SG721 contract`,
    href: '/contracts/sg721/migrate',
  },
]

export const vendingMinterLinkTabs: LinkTabProps[] = [
  {
    title: 'Instantiate',
    description: `Initialize a new Vending Minter contract`,
    href: '/contracts/vendingMinter/instantiate',
  },
  {
    title: 'Query',
    description: `Dispatch queries for your Vending Minter contract`,
    href: '/contracts/vendingMinter/query',
  },
  {
    title: 'Execute',
    description: `Execute Vending Minter contract actions`,
    href: '/contracts/vendingMinter/execute',
  },
  {
    title: 'Migrate',
    description: `Migrate Vending Minter contract`,
    href: '/contracts/vendingMinter/migrate',
  },
]

export const openEditionMinterLinkTabs: LinkTabProps[] = [
  {
    title: 'Query',
    description: `Dispatch queries for your Open Edition Minter contract`,
    href: '/contracts/openEditionMinter/query',
  },
  {
    title: 'Execute',
    description: `Execute Open Edition Minter contract actions`,
    href: '/contracts/openEditionMinter/execute',
  },
  {
    title: 'Migrate',
    description: `Migrate Open Edition Minter contract`,
    href: '/contracts/openEditionMinter/migrate',
  },
]

export const baseMinterLinkTabs: LinkTabProps[] = [
  {
    title: 'Instantiate',
    description: `Initialize a new Base Minter contract`,
    href: '/contracts/baseMinter/instantiate',
  },
  {
    title: 'Query',
    description: `Dispatch queries for your Base Minter contract`,
    href: '/contracts/baseMinter/query',
  },
  {
    title: 'Execute',
    description: `Execute Base Minter contract actions`,
    href: '/contracts/baseMinter/execute',
  },
  {
    title: 'Migrate',
    description: `Migrate Base Minter contract`,
    href: '/contracts/baseMinter/migrate',
  },
]

export const whitelistLinkTabs: LinkTabProps[] = [
  {
    title: 'Instantiate',
    description: `Initialize a new Whitelist contract`,
    href: '/contracts/whitelist/instantiate',
  },
  {
    title: 'Query',
    description: `Dispatch queries for your Whitelist contract`,
    href: '/contracts/whitelist/query',
  },
  {
    title: 'Execute',
    description: `Execute Whitelist contract actions`,
    href: '/contracts/whitelist/execute',
  },
]

export const badgeHubLinkTabs: LinkTabProps[] = [
  {
    title: 'Instantiate',
    description: `Initialize a new Badge Hub contract`,
    href: '/contracts/badgeHub/instantiate',
  },
  {
    title: 'Query',
    description: `Dispatch queries for your Badge Hub contract`,
    href: '/contracts/badgeHub/query',
  },
  {
    title: 'Execute',
    description: `Execute Badge Hub contract actions`,
    href: '/contracts/badgeHub/execute',
  },
  {
    title: 'Migrate',
    description: `Migrate Badge Hub contract`,
    href: '/contracts/badgeHub/migrate',
  },
]

export const splitsLinkTabs: LinkTabProps[] = [
  {
    title: 'Instantiate',
    description: `Initialize a new Splits contract`,
    href: '/contracts/splits/instantiate',
  },
  {
    title: 'Query',
    description: `Dispatch queries for your Splits contract`,
    href: '/contracts/splits/query',
  },
  {
    title: 'Execute',
    description: `Execute Splits contract actions`,
    href: '/contracts/splits/execute',
  },
  {
    title: 'Migrate',
    description: `Migrate Splits contract`,
    href: '/contracts/splits/migrate',
  },
]

export const royaltyRegistryLinkTabs: LinkTabProps[] = [
  {
    title: 'Query',
    description: `Dispatch queries for your Royalty Registry contract`,
    href: '/contracts/royaltyRegistry/query',
  },
  {
    title: 'Execute',
    description: `Execute Royalty Registry contract actions`,
    href: '/contracts/royaltyRegistry/execute',
  },
]

export const authzLinkTabs: LinkTabProps[] = [
  {
    title: 'Grant',
    description: `Grant authorizations to a given address`,
    href: '/authz/grant',
  },
  {
    title: 'Revoke',
    description: `Revoke already granted authorizations`,
    href: '/authz/revoke',
  },
]

export const snapshotLinkTabs: LinkTabProps[] = [
  {
    title: 'Collection Holders',
    description: `Take a snapshot of collection holders`,
    href: '/snapshots/holders',
  },
  {
    title: 'Chain Snapshots',
    description: `Export a list of users fulfilling a given condition`,
    href: '/snapshots/chain',
  },
]

export const manageContractAdminLinkTabs: LinkTabProps[] = [
  {
    title: 'Update Collection Admin',
    description: `Transfer all collection admin privileges to a new address`,
    href: '/contracts/manageContractAdmin/updateCollectionAdmin',
  },
  {
    title: 'Update Contract Admin',
    description: `Update the admin address of a contract`,
    href: '/contracts/manageContractAdmin/updateAdmin',
  },
  {
    title: 'Clear Contract Admin',
    description: `Clear the admin address of a contract`,
    href: '/contracts/manageContractAdmin/clearAdmin',
  },
]
