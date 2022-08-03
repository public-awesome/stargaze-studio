import { Button } from 'components/Button'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/sg721/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/sg721/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput, TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { JsonTextArea } from 'components/forms/FormTextArea'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { sg721LinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { DispatchExecuteArgs } from 'contracts/sg721/messages/execute'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'contracts/sg721/messages/execute'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { parseJson } from 'utils/json'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const Sg721ExecutePage: NextPage = () => {
  const { sg721: contract } = useContracts()
  const wallet = useWallet()

  const [lastTx, setLastTx] = useState('')

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const tokenIdState = useInputState({
    id: 'token-id',
    name: 'tokenId',
    title: 'Token ID',
    subtitle: 'Enter the token ID',
    placeholder: '1',
  })

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Minter Address',
    subtitle: 'Address of the Minter contract',
  })

  const messageState = useInputState({
    id: 'message',
    name: 'message',
    title: 'Message',
    subtitle: 'Message to execute on the contract',
    defaultValue: JSON.stringify({ key: 'value' }, null, 2),
  })

  const recipientState = useInputState({
    id: 'recipient-address',
    name: 'recipient',
    title: 'Recipient Address',
    subtitle: 'Address of the recipient',
  })

  const operatorState = useInputState({
    id: 'operator-address',
    name: 'operator',
    title: 'Operator Address',
    subtitle: 'Address of the operator',
  })

  const tokenURIState = useInputState({
    id: 'token-uri',
    name: 'tokenURI',
    title: 'Token URI',
    subtitle: 'URI for the token',
    placeholder: 'ipfs://xyz...',
  })

  const showTokenIdField = isEitherType(type, ['transfer_nft', 'send_nft', 'approve', 'revoke', 'mint', 'burn'])
  const showRecipientField = isEitherType(type, ['transfer_nft', 'send_nft', 'approve', 'revoke', 'mint'])
  const showOperatorField = isEitherType(type, ['approve_all', 'revoke_all'])
  const showMessageField = type === 'send_nft'
  const showTokenURIField = type === 'mint'

  const messages = useMemo(() => contract?.use(contractState.value), [contract, contractState.value])
  const payload: DispatchExecuteArgs = {
    contract: contractState.value,
    tokenId: tokenIdState.value,
    messages,
    recipient: recipientState.value,
    operator: operatorState.value,
    type,
    tokenURI: tokenURIState.value,
    msg: parseJson(messageState.value) || {},
  }
  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select message type!')
      }
      if (!wallet.initialized) {
        throw new Error('Please connect your wallet.')
      }
      const txHash = await toast.promise(dispatchExecute(payload), {
        error: `${type.charAt(0).toUpperCase() + type.slice(1)} execute failed!`,
        loading: 'Executing message...',
        success: (tx) => `Transaction ${tx} success!`,
      })
      if (txHash) {
        setLastTx(txHash)
      }
    },
    {
      onError: (error) => {
        toast.error(String(error))
      },
    },
  )

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute Sg721 Contract" />
      <ContractPageHeader
        description="Sg721 contract is a wrapper contract that has a set of optional extensions on top of cw721-base."
        link={links.Documentation}
        title="Sg721 Contract"
      />
      <LinkTabs activeIndex={2} data={sg721LinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          {showRecipientField && <AddressInput {...recipientState} />}
          {showOperatorField && <AddressInput {...operatorState} />}
          {showTokenIdField && <TextInput {...tokenIdState} />}
          {showTokenURIField && <TextInput {...tokenURIState} />}
          {showMessageField && <JsonTextArea {...messageState} />}
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

export default withMetadata(Sg721ExecutePage, { center: false })
