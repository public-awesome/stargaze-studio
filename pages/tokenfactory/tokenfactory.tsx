/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable react/button-has-type */

import type { Coin } from '@cosmjs/proto-signing'
import { Registry } from '@cosmjs/proto-signing'
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import type { Metadata } from 'cosmjs-types/cosmos/bank/v1beta1/bank'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { Field, Type } from 'protobufjs'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { useWallet } from 'utils/wallet'

export type MessageType = 'MsgCreateDenom' | 'MsgMint' | 'MsgSetDenomMetadata'

interface MsgCreateDenom {
  sender: string
  /** subdenom can be up to 44 "alphanumeric" characters long. */
  subdenom: string
}

interface MsgSetDenomMetadata {
  sender: string
  metadata: Metadata
}

interface MsgMint {
  sender: string
  amount: Coin
  mintToAddress: string
}

const MsgSetDenomMetadata = new Type('MsgSetDenomMetadata')
  .add(new Field('sender', 1, 'string', 'required'))
  .add(new Field('metadata', 2, 'Metadata', 'required'))

const MetadataType = new Type('Metadata')
  .add(new Field('description', 1, 'string'))
  .add(new Field('denomUnits', 2, 'DenomUnit', 'repeated'))
  .add(new Field('base', 3, 'string'))
  .add(new Field('display', 4, 'string'))
  .add(new Field('name', 5, 'string'))
  .add(new Field('symbol', 6, 'string'))
// .add(new Field("uri", 7, "string"))
// .add(new Field("uriHash", 8, "string"))

const DenomUnitType = new Type('DenomUnit')
  .add(new Field('denom', 1, 'string'))
  .add(new Field('exponent', 2, 'int32'))
  .add(new Field('aliases', 3, 'string', 'repeated'))

MetadataType.add(DenomUnitType)
MsgSetDenomMetadata.add(MetadataType)

const MsgCreateDenom = new Type('MsgCreateDenom')
  .add(new Field('sender', 1, 'string', 'required'))
  .add(new Field('subdenom', 2, 'string', 'required'))

const MsgMint = new Type('MsgMint')
  .add(new Field('sender', 1, 'string', 'required'))
  .add(new Field('amount', 2, 'Coin', 'required'))
  .add(new Field('mintToAddress', 3, 'string', 'required'))

const CoinType = new Type('Coin').add(new Field('denom', 1, 'string')).add(new Field('amount', 2, 'string'))

MsgMint.add(CoinType)

const typeUrlMsgSetDenomMetadata = '/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata'
const typeUrlMsgCreateDenom = '/osmosis.tokenfactory.v1beta1.MsgCreateDenom'
const typeUrlMsgMint = '/osmosis.tokenfactory.v1beta1.MsgMint'

const typeEntries: [string, Type][] = [
  [typeUrlMsgSetDenomMetadata, MsgSetDenomMetadata],
  [typeUrlMsgCreateDenom, MsgCreateDenom],
  [typeUrlMsgMint, MsgMint],
]

export const registry = new Registry(typeEntries)

const Tokenfactory: NextPage = () => {
  const wallet = useWallet()

  const [messageType, setMessageType] = useState<MessageType>('MsgCreateDenom')

  const subdenomState = useInputState({
    id: 'subdenom',
    name: 'subdenom',
    title: 'Subdenom',
    defaultValue: 'utoken',
  })

  const handleSendMessage = async () => {
    try {
      if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')

      const offlineSigner = wallet.getOfflineSignerDirect()
      const stargateClient = await SigningStargateClient.connectWithSigner(
        'https://rpc.elgafar-1.stargaze-apis.com/',
        offlineSigner,
        {
          gasPrice: GasPrice.fromString('0.025ustars'),
          registry,
        },
      )

      const msgCreateDenom = {
        typeUrl: typeUrlMsgCreateDenom,
        value: {
          sender: wallet.address,
          subdenom: subdenomState.value,
        },
      }

      const response = await stargateClient.signAndBroadcast(wallet.address as string, [msgCreateDenom], 'auto')
      console.log('response: ', response)

      toast.success(`${messageType}success.`, { style: { maxWidth: 'none' } })
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      console.error('Error: ', error)
    }
  }

  return (
    <section className="px-4 pt-4 pb-16 mx-auto space-y-8 ml-8 w-full">
      <NextSeo title="TokenFactory" />
      <ContractPageHeader
        description="Here you can create, mint and manage tokens."
        link={links.Documentation}
        title="Token Factory"
      />

      <select onChange={(e) => setMessageType(e.target.value as MessageType)}>
        <option value="MsgCreateDenom">Create Denom</option>
        <option value="MsgMint">Mint</option>
        <option value="MsgSetDenomMetadata">Set Denom Metadata</option>
      </select>
      <TextInput className="w-3/4" {...subdenomState} />
      <button
        className="px-4 py-2 font-bold text-white bg-stargaze rounded-md"
        onClick={() => {
          void handleSendMessage()
        }}
      >
        {' '}
        Export Snapshot
      </button>
    </section>
  )
}

export default withMetadata(Tokenfactory, { center: false })
