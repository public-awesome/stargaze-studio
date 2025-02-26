/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable tailwindcss/classnames-order */

import type { EncodeObject } from '@cosmjs/proto-signing'
import { Registry } from '@cosmjs/proto-signing'
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { DenomUnits } from 'components/forms/DenomUnits'
import { useDenomUnitsState } from 'components/forms/DenomUnits.hooks'
import { AddressInput, NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { Field, Type } from 'protobufjs'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { NETWORK } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { useWallet } from 'utils/wallet'

export type MessageType = 'MsgCreateDenom' | 'MsgMint' | 'MsgSetDenomMetadata' | 'MsgSend' | 'MsgChangeAdmin'

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
  .add(new Type('Coin').add(new Field('denom', 1, 'string')).add(new Field('amount', 2, 'string')))

const MsgSend = new Type('MsgSend')
  .add(new Field('fromAddress', 1, 'string'))
  .add(new Field('toAddress', 2, 'string'))
  .add(new Field('amount', 3, 'Coin', 'repeated'))
  .add(new Type('Coin').add(new Field('denom', 1, 'string')).add(new Field('amount', 2, 'string')))

const MsgChangeAdmin = new Type('MsgChangeAdmin')
  .add(new Field('sender', 1, 'string', 'required'))
  .add(new Field('denom', 2, 'string', 'required'))
  .add(new Field('newAdmin', 3, 'string', 'required'))

const typeUrlMsgSetDenomMetadata = '/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata'
const typeUrlMsgCreateDenom = '/osmosis.tokenfactory.v1beta1.MsgCreateDenom'
const typeUrlMsgMint = '/osmosis.tokenfactory.v1beta1.MsgMint'
const typeUrlMsgSend = '/cosmos.bank.v1beta1.MsgSend'
const typeUrlMsgChangeAdmin = '/osmosis.tokenfactory.v1beta1.MsgChangeAdmin'

const typeEntries: [string, Type][] = [
  [typeUrlMsgSetDenomMetadata, MsgSetDenomMetadata],
  [typeUrlMsgCreateDenom, MsgCreateDenom],
  [typeUrlMsgMint, MsgMint],
  [typeUrlMsgSend, MsgSend],
  [typeUrlMsgChangeAdmin, MsgChangeAdmin],
]

export const registry = new Registry(typeEntries)

const Tokenfactory: NextPage = () => {
  const wallet = useWallet()

  const [messageType, setMessageType] = useState<MessageType>('MsgCreateDenom')
  const [loading, setLoading] = useState(false)

  const denomState = useInputState({
    id: 'denom',
    name: 'denom',
    title: 'Denom',
    placeholder: `factory/${wallet.isWalletConnected && wallet.address ? wallet.address : 'stars1...'}/utoken`,
    defaultValue: `factory/${wallet.isWalletConnected && wallet.address ? wallet.address : 'stars1...'}/utoken`,
    subtitle: 'The full denom for the token',
  })

  const subdenomState = useInputState({
    id: 'subdenom',
    name: 'subdenom',
    title: 'Subdenom',
    placeholder: 'utoken',
    subtitle: 'The subdenom can be up to 44 alphanumeric characters long',
  })

  const amountState = useNumberInputState({
    id: 'amount',
    name: 'amount',
    title: 'Amount',
    placeholder: '1000000',
    subtitle: `The amount of tokens to ${messageType === 'MsgMint' ? 'mint' : 'send'}`,
  })

  const mintToAddressState = useInputState({
    id: 'mintToAddress',
    name: 'mintToAddress',
    title: 'Mint To Address',
    placeholder: 'stars1...',
    defaultValue: wallet.address ?? '',
    subtitle: 'The address to mint tokens to',
  })

  const recipientAddressState = useInputState({
    id: 'recipientAddress',
    name: 'recipientAddress',
    title: 'Recipient Address',
    placeholder: 'stars1...',
    subtitle: 'The address to send tokens to',
  })

  const newAdminAddressState = useInputState({
    id: 'newAdminAddress',
    name: 'newAdminAddress',
    title: 'New Admin Address',
    placeholder: 'stars1...',
    subtitle: 'The address to pass admin rights to',
  })

  // Metadata fields
  const descriptionState = useInputState({
    id: 'description',
    name: 'description',
    title: 'Description',
    placeholder: 'Token description',
    subtitle: 'The description of the token',
  })

  const baseState = useInputState({
    id: 'base',
    name: 'base',
    title: 'Base',
    placeholder: `factory/${wallet.isWalletConnected && wallet.address ? wallet.address : 'stars1...'}/utoken`,
    defaultValue: `factory/${wallet.isWalletConnected && wallet.address ? wallet.address : 'stars1...'}/utoken`,
    subtitle: 'The base denom for the token',
  })

  const displayState = useInputState({
    id: 'display',
    name: 'display',
    title: 'Display',
    placeholder: 'token',
    subtitle: 'The display name for the token',
  })

  const nameState = useInputState({
    id: 'name',
    name: 'name',
    title: 'Name',
    placeholder: 'Token',
    subtitle: 'The name of the token',
  })

  const symbolState = useInputState({
    id: 'symbol',
    name: 'symbol',
    title: 'Symbol',
    placeholder: 'TOKEN',
    subtitle: 'The symbol of the token',
  })

  const denomUnitsState = useDenomUnitsState()

  useEffect(() => {
    denomUnitsState.reset()
    denomUnitsState.add({
      denom: '',
      exponent: 0,
      aliases: '',
    })
  }, [])

  const getButtonName = () => {
    if (messageType === 'MsgCreateDenom') {
      return 'Create Denom'
    } else if (messageType === 'MsgMint') {
      return 'Mint Tokens'
    } else if (messageType === 'MsgSetDenomMetadata') {
      return 'Set Denom Metadata'
    } else if (messageType === 'MsgSend') {
      return 'Send Tokens'
    } else if (messageType === 'MsgChangeAdmin') {
      return 'Change Admin'
    }
  }

  const handleSendMessage = async () => {
    try {
      if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')
      setLoading(true)
      const offlineSigner = wallet.getOfflineSignerDirect()
      const stargateClient = await SigningStargateClient.connectWithSigner(
        NETWORK === 'intergaze-testnet'
          ? 'https://rpc.virgaze-1.intergaze-apis.com'
          : NETWORK === 'testnet'
          ? 'https://rpc.elgafar-1.stargaze-apis.com/'
          : 'https://rpc.stargaze-apis.com/',
        offlineSigner,
        {
          gasPrice: GasPrice.fromString('0.025ugaze'),
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

      const msgMint = {
        typeUrl: typeUrlMsgMint,
        value: {
          sender: wallet.address,
          amount: {
            denom: denomState.value,
            amount: amountState.value.toString(),
          },
          mintToAddress: mintToAddressState.value,
        },
      }

      const msgChangeAdmin = {
        typeUrl: typeUrlMsgChangeAdmin,
        value: {
          sender: wallet.address,
          denom: denomState.value,
          newAdmin: newAdminAddressState.value,
        },
      }

      const msgSetDenomMetadata = {
        typeUrl: typeUrlMsgSetDenomMetadata,
        value: {
          sender: wallet.address,
          metadata: {
            description: descriptionState.value,
            denomUnits: denomUnitsState.entries.map((entry) => ({
              denom: entry[1].denom,
              exponent: entry[1].exponent,
              aliases: entry[1].aliases.length > 0 ? entry[1].aliases.split(',') : [],
            })),
            base: baseState.value,
            display: displayState.value,
            name: nameState.value,
            symbol: symbolState.value,
          },
        },
      }

      const msgSend = {
        typeUrl: typeUrlMsgSend,
        value: {
          fromAddress: wallet.address,
          toAddress: recipientAddressState.value,
          amount: [
            {
              denom: denomState.value,
              amount: amountState.value.toString(),
            },
          ],
        },
      }

      const messageToSign = () => {
        if (messageType === 'MsgCreateDenom') {
          return msgCreateDenom
        } else if (messageType === 'MsgMint') {
          return msgMint
        } else if (messageType === 'MsgSetDenomMetadata') {
          return msgSetDenomMetadata
        } else if (messageType === 'MsgSend') {
          return msgSend
        } else if (messageType === 'MsgChangeAdmin') {
          return msgChangeAdmin
        }
      }

      const response = await stargateClient.signAndBroadcast(
        wallet.address as string,
        [messageToSign() as EncodeObject],
        'auto',
      )
      console.log('response: ', response)
      setLoading(false)
      toast.success(`${messageType} success.`, { style: { maxWidth: 'none' } })
    } catch (error: any) {
      setLoading(false)
      toast.error(error.message, { style: { maxWidth: 'none' } })
      console.error('Error: ', error)
    }
  }

  return (
    <section className="px-4 pt-4 pb-16 mx-auto space-y-8 ml-8 w-full">
      <NextSeo title="TokenFactory" />
      <ContractPageHeader
        description="Here you can create, mint and manage tokens."
        link="https://docs.stargaze.zone/developers/token-factory"
        title="Token Factory"
      />

      <div className="flex flex-col w-1/4">
        <span className="text-xl font-bold text-white">Message Type</span>
        <select
          className="mt-2 pt-2 pb-2 px-4 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
          onChange={(e) => setMessageType(e.target.value as MessageType)}
          value={messageType}
        >
          <option className="bg-black" value="MsgCreateDenom">
            Create Denom
          </option>
          <option className="bg-black" value="MsgMint">
            Mint
          </option>
          <option className="bg-black" value="MsgSend">
            Send Tokens
          </option>
          <option className="bg-black" value="MsgSetDenomMetadata">
            Set Denom Metadata
          </option>
          <option className="bg-black" value="MsgChangeAdmin">
            Change Admin
          </option>
        </select>
      </div>
      <Conditional test={messageType === 'MsgCreateDenom'}>
        <TextInput className="w-1/2" {...subdenomState} />
      </Conditional>
      <Conditional test={messageType === 'MsgMint'}>
        <TextInput className="w-3/5" {...denomState} />
        <NumberInput className="w-1/4" {...amountState} />
        <AddressInput className="w-3/5" {...mintToAddressState} />
      </Conditional>
      <Conditional test={messageType === 'MsgSend'}>
        <TextInput className="w-3/5" {...denomState} />
        <NumberInput className="w-1/4" {...amountState} />
        <AddressInput className="w-1/2" {...recipientAddressState} />
      </Conditional>
      <Conditional test={messageType === 'MsgSetDenomMetadata'}>
        <TextInput className="w-1/2" {...descriptionState} />
        <TextInput className="w-1/2" {...baseState} />
        <TextInput className="w-1/2" {...displayState} />
        <TextInput className="w-1/2" {...nameState} />
        <TextInput className="w-1/2" {...symbolState} />
        <DenomUnits
          attributes={denomUnitsState.entries}
          onAdd={denomUnitsState.add}
          onChange={denomUnitsState.update}
          onRemove={denomUnitsState.remove}
          subtitle="Enter the denom units for the token"
          title="Denom Units"
        />
      </Conditional>
      <Conditional test={messageType === 'MsgChangeAdmin'}>
        <TextInput className="w-1/2" {...denomState} />
        <AddressInput className="w-1/2" {...newAdminAddressState} />
      </Conditional>
      <Button
        className="px-4 py-2 font-bold text-white bg-stargaze rounded-md"
        isLoading={loading}
        onClick={() => {
          void handleSendMessage()
        }}
      >
        {' '}
        {getButtonName()}
      </Button>
    </section>
  )
}

export default withMetadata(Tokenfactory, { center: false })
