// Styles required for @cosmos-kit/react modal
import '@interchain-ui/react/styles'

import { GasPrice } from '@cosmjs/stargate'
import { wallets as keplrExtensionWallets } from '@cosmos-kit/keplr-extension'
import { wallets as leapExtensionWallets } from '@cosmos-kit/leap-extension'
import { ChainProvider } from '@cosmos-kit/react'
import { assets, chains } from 'chain-registry'
import { getConfig } from 'config'
import type { ReactNode } from 'react'
import { NETWORK } from 'utils/constants'

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { gasPrice, feeToken } = getConfig(NETWORK)
  return (
    <ChainProvider
      assetLists={assets}
      chains={chains}
      signerOptions={{
        signingCosmwasm: () => ({
          gasPrice: GasPrice.fromString(`${gasPrice}${feeToken}`),
        }),
        signingStargate: () => ({
          gasPrice: GasPrice.fromString(`${gasPrice}${feeToken}`),
        }),
      }}
      wallets={[...keplrExtensionWallets, ...leapExtensionWallets]}
    >
      {children}
    </ChainProvider>
  )
}
