import type { AppConfig } from './app'

export const mainnetConfig: AppConfig = {
  chainId: 'stargaze-1',
  chainName: 'Stargaze',
  addressPrefix: 'stars',
  rpcUrl: 'https://rpc.stargaze-apis.com/',
  feeToken: 'ustars',
  stakingToken: 'ustars',
  coinMap: {
    ustars: { denom: 'STARS', fractionalDigits: 6 },
  },
  gasPrice: 0.025,
  fees: {
    upload: 1500000,
    init: 500000,
    exec: 200000,
  },
}

export const testnetConfig: AppConfig = {
  chainId: 'elgafar-1',
  chainName: 'elgafar-1',
  addressPrefix: 'stars',
  rpcUrl: 'https://rpc.elgafar-1.stargaze-apis.com/',
  httpUrl: 'https://rest.elgafar-1.stargaze-apis.com/',
  feeToken: 'ustars',
  stakingToken: 'ustars',
  coinMap: {
    ustars: { denom: 'STARS', fractionalDigits: 6 },
  },
  gasPrice: 0.025,
  fees: {
    upload: 1500000,
    init: 500000,
    exec: 200000,
  },
}

export const getConfig = (network: string): AppConfig => {
  if (network === 'mainnet') return mainnetConfig
  return testnetConfig
}
