import { toast } from 'react-hot-toast'

import { isValidAddress } from './isValidAddress'

export interface AirdropAllocation {
  address: string
  amount: string
}

export const isValidAccountsFile = (file: AirdropAllocation[]) => {
  let sumOfAmounts = 0
  file.forEach((allocation) => {
    sumOfAmounts += Number(allocation.amount)
  })
  if (sumOfAmounts > 10000) {
    toast.error(`Accounts file must cover less than 10000 tokens`)
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
    if (!Number.isInteger(Number(account.amount)) || !(Number(account.amount) > 0)) {
      return { amount: false }
    }
    return null
  })

  const isStargazeAddresses = file.every(
    (account) => account.address.trim().startsWith('stars') || account.address.trim().endsWith('.stars'),
  )
  if (!isStargazeAddresses) {
    toast.error('All accounts must be on the same network')
    return false
  }

  if (checks.filter((check) => check?.address === false).length > 0) {
    toast.error('Invalid address in file')
    return false
  }
  if (checks.filter((check) => check?.amount === false).length > 0) {
    toast.error('Invalid amount in file. Amount must be a positive integer.')
    return false
  }

  // if (duplicateCheck.length > 0) {
  //   toast.error('The file contains duplicate addresses.')
  //   return false
  // }

  return true
}
