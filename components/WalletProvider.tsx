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
      allowedIframeParentOrigins={['https://daodao.zone', 'https://dao.daodao.zone', 'https://testnet.daodao.zone']}
      assetLists={assets}
      chains={chains}
      endpointOptions={{
        endpoints: {
          stargaze: {
            rpc: ['https://rpc.stargaze-apis.com/'],
            rest: ['https://rest.stargaze-apis.com/'],
          },
          stargazetestnet: {
            rpc: ['https://stargaze-testnet-rpc.polkachu.com/'],
            rest: ['https://stargaze-testnet-api.polkachu.com/'],
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
      wallets={[...keplrExtensionWallets, ...leapExtensionWallets]}
    >
      {children}
    </ChainProvider>
  )
}
