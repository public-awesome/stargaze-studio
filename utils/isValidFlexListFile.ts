import type { WhitelistFlexMember } from 'components/WhitelistFlexUpload'
import { toast } from 'react-hot-toast'

import { isValidAddress } from './isValidAddress'

export const isValidFlexListFile = (file: WhitelistFlexMember[]) => {
  let sumOfAmounts = 0
  file.forEach((allocation) => {
    sumOfAmounts += Number(allocation.mint_count)
  })
  if (sumOfAmounts > 10000) {
    toast.error(`Total mint count should be less than 10000 tokens (current count: ${sumOfAmounts}))`)
    return false
  }

  const checks = file.map((account) => {
    // Check if address is valid bech32 address
    if (account.address.trim().startsWith('stars')) {
      if (!isValidAddress(account.address.trim())) {
        return { address: false }
      }
    }
    // Check if address start with stars
    if (!account.address.trim().startsWith('stars') && !account.address.trim().endsWith('.stars')) {
      return { address: false }
    }
    // Check if amount is valid
    if (!Number.isInteger(Number(account.mint_count)) || !(Number(account.mint_count) > 0)) {
      return { mint_count: false }
    }
    return null
  })

  const isStargazeAddresses = file.every(
    (account) => account.address.trim().startsWith('stars') || account.address.trim().endsWith('.stars'),
  )
  if (!isStargazeAddresses) {
    toast.error('All accounts must be on the Stargaze network')
    return false
  }

  if (checks.filter((check) => check?.address === false).length > 0) {
    toast.error('Invalid address in file')
    return false
  }
  if (checks.filter((check) => check?.mint_count === false).length > 0) {
    toast.error('Invalid mint count in file. Mint count must be a positive integer.')
    return false
  }

  return true
}
