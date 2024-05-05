import type { AppConfig } from './app'

export const mainnetConfig: AppConfig = {
  chainId: 'stargaze-1',
  chainName: 'Stargaze',
  addressPrefix: 'stars',
  rpcUrl: 'https://rpc.stargaze-apis.com/',
  httpUrl: 'https://rest.stargaze-apis.com/',
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

export const fangTestnetConfig: AppConfig = {
  chainId: 'fang-1',
  chainName: 'fang-1',
  addressPrefix: 'stars',
  rpcUrl: 'https://rpc.fang-1.stargaze-apis.com/',
  httpUrl: 'https://rest.fang-1.stargaze-apis.com/',
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
  else if (network === 'fang-testnet') return fangTestnetConfig
  return testnetConfig
}
