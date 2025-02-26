import type { AssetList, Chain } from '@chain-registry/types'

export const intergazeTestnet: Chain = {
  $schema: '../../chain.schema.json',
  chain_type: 'cosmos',
  chain_name: 'virgaze-1',
  status: 'live',
  network_type: 'testnet',
  website: 'https://intergaze.xyz',
  pretty_name: 'Intergaze Testnet',
  chain_id: 'virgaze-1',
  bech32_prefix: 'init',
  daemon_name: 'starsd',
  node_home: '$HOME/.starsd',
  slip44: 118,
  fees: {
    fee_tokens: [
      {
        denom: 'ugaze',
        low_gas_price: 0.3,
        average_gas_price: 0.4,
        high_gas_price: 0.5,
      },
    ],
  },
  codebase: {
    git_repo: 'https://github.com/public-awesome/stargaze',
    recommended_version: 'v7.0.0',
    compatible_versions: ['v7.0.0'],
    cosmos_sdk_version: '0.45',
    consensus: {
      type: 'tendermint',
      version: '0.34',
    },
    cosmwasm_version: '0.28',
    cosmwasm_enabled: true,
    genesis: {
      genesis_url: 'https://github.com/public-awesome/testnets/blob/main/elgafar-1/genesis/genesis.tar.gz?raw=true',
    },
    versions: [
      {
        name: 'v7.0.0',
        recommended_version: 'v7.0.0',
        compatible_versions: ['v7.0.0'],
        cosmos_sdk_version: '0.45',
        consensus: {
          type: 'tendermint',
          version: '0.34',
        },
        cosmwasm_version: '0.28',
        cosmwasm_enabled: true,
      },
    ],
  },
  peers: {
    seeds: [],
    persistent_peers: [
      {
        id: 'e31886cba90a06e165b0df18cc5c8ae015ecd23e',
        address: '209.159.152.82:26656',
        provider: 'stargaze',
      },
      {
        id: 'de00d2d65594b672469ecd65826a94ec1be80b9f',
        address: '208.73.205.226:26656',
        provider: 'stargaze',
      },
      {
        id: '496ac0ba20188f70f41e0a814dfd4d9a617338f8',
        address: 'stargaze-testnet-seed.ibs.team:16652',
        provider: 'Inter Blockchain Services',
      },
    ],
  },
  apis: {
    rpc: [
      {
        address: 'https://rpc.virgaze-1.intergaze-apis.com',
        provider: 'Stargaze Foundation',
      },
    ],
    rest: [
      {
        address: 'https://rest.virgaze-1.intergaze-apis.com',
        provider: 'Stargaze Foundation',
      },
    ],
    grpc: [
      {
        address: 'http://grpc-1.virgaze-1.intergaze-apis.com:26660',
        provider: 'Stargaze Foundation',
      },
    ],
  },
}

export const intergazeTestnetAssetList: AssetList = {
  $schema: '../../assetlist.schema.json',
  chain_name: 'virgaze-1',
  assets: [
    {
      description: 'The native token of Intergaze Testnet',
      type_asset: 'sdk.coin',
      denom_units: [
        {
          denom: 'ugaze',
          exponent: 0,
        },
        {
          denom: 'gaze',
          exponent: 6,
        },
      ],
      base: 'ugaze',
      name: 'Intergaze Testnet Token',
      display: 'gaze',
      symbol: 'GAZE',
      logo_URIs: {
        png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png',
      },
      coingecko_id: 'stargaze',
      images: [
        {
          png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png',
        },
      ],
    },
  ],
}
