// Styles required for @cosmos-kit/react modal
import '@interchain-ui/react/styles'

import { GasPrice } from '@cosmjs/stargate'
import { wallets as initiaExtensionWallets } from '@cosmos-kit/initia-extension'
import { wallets as keplrExtensionWallets } from '@cosmos-kit/keplr-extension'
import { wallets as leapExtensionWallets } from '@cosmos-kit/leap-extension'
import { ChainProvider } from '@cosmos-kit/react'
import { assets, chains } from 'chain-registry'
import { getConfig } from 'config'
import { intergazeTestnet, intergazeTestnetAssetList } from 'config/intergazeTestnet'
import type { ReactNode } from 'react'
import { NETWORK } from 'utils/constants'

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { gasPrice, feeToken } = getConfig(NETWORK)
  return (
    <ChainProvider
      assetLists={[...assets, intergazeTestnetAssetList]}
      chains={[...chains, intergazeTestnet]}
      endpointOptions={{
        endpoints: {
          stargaze: {
            rpc: ['https://rpc.stargaze-apis.com/'],
            rest: ['https://rest.stargaze-apis.com/'],
          },
          stargazetestnet: {
            rpc: ['https://rpc.elgafar-1.stargaze-apis.com/'],
            rest: ['https://rest.elgafar-1.stargaze-apis.com/'],
          },
          intergazeTestnet: {
            rpc: ['https://rpc.virgaze-1.intergaze-apis.com/'],
            rest: ['https://rest.virgaze-1.intergaze-apis.com/'],
          },
        },
        isLazy: true,
      }}
      sessionOptions={{
        duration: 1000 * 60 * 60 * 12, // 12 hours
      }}
      signerOptions={{
        signingCosmwasm: () => ({
          gasPrice: GasPrice.fromString(`${gasPrice}${feeToken}`),
        }),
        signingStargate: () => ({
          gasPrice: GasPrice.fromString(`${gasPrice}${feeToken}`),
        }),
      }}
      wallets={[...initiaExtensionWallets, ...keplrExtensionWallets, ...leapExtensionWallets]}
    >
      {children}
    </ChainProvider>
  )
}
