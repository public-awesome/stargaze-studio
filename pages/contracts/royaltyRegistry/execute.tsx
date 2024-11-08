import clsx from 'clsx'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/royaltyRegistry/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/royaltyRegistry/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { royaltyRegistryLinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import type { DispatchExecuteArgs } from 'contracts/royaltyRegistry/messages/execute'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'contracts/royaltyRegistry/messages/execute'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import {
  INFINITY_SWAP_PROTOCOL_ADDRESS,
  MARKETPLACE_V2_CONTRACT_ADDRESS,
  ROYALTY_REGISTRY_ADDRESS,
} from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { useWallet } from 'utils/wallet'

export const protocolList = [
  { name: 'Infinity Swap', address: INFINITY_SWAP_PROTOCOL_ADDRESS },
  { name: 'Marketplace v2', address: MARKETPLACE_V2_CONTRACT_ADDRESS },
]

const RoyaltyRegistryExecutePage: NextPage = () => {
  const { royaltyRegistry: contract } = useContracts()
  const wallet = useWallet()

  const [lastTx, setLastTx] = useState('')
  const [manualProtocolInput, setManualProtocolInput] = useState(false)

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Royalty Registry Address',
    subtitle: 'Address of the Royalty Registry contract',
    defaultValue: ROYALTY_REGISTRY_ADDRESS,
  })
  const contractAddress = contractState.value

  const collectionAddressState = useInputState({
    id: 'collection-address',
    name: 'collection-address',
    title: 'Collection Address',
    subtitle: 'Address of the collection',
  })

  const collectionAddress = collectionAddressState.value

  const protocolAddressState = useInputState({
    id: 'protocol-address',
    name: 'protocol-address',
    title: 'Protocol Address',
    subtitle: 'Address of the protocol',
    defaultValue: INFINITY_SWAP_PROTOCOL_ADDRESS,
  })

  const recipientAddressState = useInputState({
    id: 'recipient-address',
    name: 'recipient-address',
    title: 'Recipient Address',
    subtitle: 'Address of the recipient',
  })

  const shareState = useNumberInputState({
    id: 'share',
    name: 'share',
    title: 'Share',
    subtitle: 'Share percentage',
    placeholder: '4%',
  })

  const shareDeltaState = useNumberInputState({
    id: 'share-delta',
    name: 'share-delta',
    title: 'Share Delta',
    subtitle: 'The change of share percentage',
    placeholder: '1%',
  })

  const [decrement, setDecrement] = useState(false)

  const showRecipientAddress = isEitherType(type, [
    'set_collection_royalty_default',
    'set_collection_royalty_protocol',
    'update_collection_royalty_default',
    'update_collection_royalty_protocol',
  ])

  const messages = useMemo(() => contract?.use(contractState.value), [contract, contractState.value])
  const payload: DispatchExecuteArgs = {
    contract: contractState.value,
    messages,
    type,
    collection: collectionAddressState.value,
    protocol: protocolAddressState.value,
    recipient: recipientAddressState.value,
    share: shareState.value,
    shareDelta: shareDeltaState.value,
    decrement,
  }
  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select message type!')
      }
      if (!wallet.isWalletConnected) {
        throw new Error('Please connect your wallet.')
      }
      const txHash = await toast.promise(
        dispatchExecute(payload),
        {
          error: `${type.charAt(0).toUpperCase() + type.slice(1)} execute failed!`,
          loading: 'Executing message...',
          success: (tx) => `Transaction ${tx} success!`,
        },
        { style: { maxWidth: 'none' } },
      )
      if (txHash) {
        setLastTx(txHash)
      }
    },
    {
      onError: (error) => {
        toast.error(String(error), { style: { maxWidth: 'none' } })
      },
    },
  )

  const router = useRouter()

  useEffect(() => {
    if (collectionAddress.length > 0) {
      void router.replace({ query: { collectionAddress } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionAddress])
  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('collectionAddress')
    if (initial && initial.length > 0) collectionAddressState.onChange(initial)
  }, [])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute Royalty Registry Contract" />
      <ContractPageHeader
        description="Royalty Registry allows NFT collection owners to define the royalties that should be paid to them."
        link={links.Documentation}
        title="Royalty Registry Contract"
      />
      <LinkTabs activeIndex={1} data={royaltyRegistryLinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...collectionAddressState} />
          <ExecuteCombobox {...comboboxState} />
          <Conditional
            test={isEitherType(type, ['set_collection_royalty_protocol', 'update_collection_royalty_protocol'])}
          >
            <span className="mr-4 font-bold">Selected Protocol</span>
            <select
              className="py-2 px-4 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
              onChange={(e) => {
                if (e.target.value) {
                  protocolAddressState.onChange(e.target.value)
                  setManualProtocolInput(false)
                } else {
                  protocolAddressState.onChange('')
                  setManualProtocolInput(true)
                }
              }}
            >
              {protocolList.map((protocol) => (
                <option key={protocol.address} value={protocol.address}>
                  {protocol.name}
                </option>
              ))}
              <option value="">Manual Input</option>
            </select>
            <Conditional test={manualProtocolInput}>
              <AddressInput {...protocolAddressState} />
            </Conditional>
          </Conditional>
          <Conditional test={showRecipientAddress}>
            <AddressInput {...recipientAddressState} />
          </Conditional>
          <Conditional test={isEitherType(type, ['set_collection_royalty_protocol', 'set_collection_royalty_default'])}>
            <NumberInput {...shareState} />
          </Conditional>
          <Conditional
            test={isEitherType(type, ['update_collection_royalty_default', 'update_collection_royalty_protocol'])}
          >
            <NumberInput {...shareDeltaState} />
            <div className="flex flex-row space-y-2 w-1/4">
              <div className={clsx('flex flex-col space-y-2 w-full form-control')}>
                <label className="justify-start cursor-pointer label">
                  <div className="flex flex-col">
                    <span className="mr-4 font-bold">Increment</span>
                  </div>
                  <input
                    checked={decrement}
                    className={`toggle ${decrement ? `bg-stargaze` : `bg-gray-600`}`}
                    onClick={() => setDecrement(!decrement)}
                    type="checkbox"
                  />
                </label>
              </div>
              <span className="mx-4 font-bold">Decrement</span>
            </div>
          </Conditional>
        </div>

        <div className="space-y-8">
          <div className="relative">
            <Button className="absolute top-0 right-0" isLoading={isLoading} rightIcon={<FaArrowRight />} type="submit">
              Execute
            </Button>
            <FormControl subtitle="View execution transaction hash" title="Transaction Hash">
              <TransactionHash hash={lastTx} />
            </FormControl>
          </div>
          <FormControl subtitle="View current message to be sent" title="Payload Preview">
            <JsonPreview content={previewExecutePayload(payload)} isCopyable />
          </FormControl>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(RoyaltyRegistryExecutePage, { center: false })
