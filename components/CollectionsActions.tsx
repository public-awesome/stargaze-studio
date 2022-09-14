import { Button } from 'components/Button'
import type { DispatchExecuteArgs } from 'components/collections/actions/actions'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'components/collections/actions/actions'
import { ActionsCombobox } from 'components/collections/actions/Combobox'
import { useActionsComboboxState } from 'components/collections/actions/Combobox.hooks'
import { QueryCombobox } from 'components/collections/queries/Combobox'
import { useQueryComboboxState } from 'components/collections/queries/Combobox.hooks'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { TransactionHash } from 'components/TransactionHash'
import { WhitelistUpload } from 'components/WhitelistUpload'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { links } from 'utils/links'

import { TextInput } from './forms/FormInput'

export const CollectionActions: NextPage = () => {
  const { minter: minterContract, sg721: sg721Contract } = useContracts()
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')

  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)
  const [airdropArray, setAirdropArray] = useState<string[]>([])

  const comboboxState = useActionsComboboxState()
  const qcomboboxState = useQueryComboboxState()
  const type = comboboxState.value?.id

  const sg721ContractState = useInputState({
    id: 'sg721-contract-address',
    name: 'sg721-contract-address',
    title: 'Sg721 Address',
    subtitle: 'Address of the Sg721 contract',
  })

  const minterContractState = useInputState({
    id: 'minter-contract-address',
    name: 'minter-contract-address',
    title: 'Minter Address',
    subtitle: 'Address of the Minter contract',
  })

  const limitState = useNumberInputState({
    id: 'per-address-limi',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Enter the per address limit',
  })

  const tokenIdState = useNumberInputState({
    id: 'token-id',
    name: 'tokenId',
    title: 'Token ID',
    subtitle: 'Enter the token ID',
  })

  const batchNumberState = useNumberInputState({
    id: 'batch-number',
    name: 'batchNumber',
    title: 'Number of Tokens',
    subtitle: 'Enter the number of tokens to mint',
  })

  const tokenIdListState = useInputState({
    id: 'token-id-list',
    name: 'tokenIdList',
    title: 'List of token IDs',
    subtitle:
      'Specify individual token IDs separated by commas (e.g., 2, 4, 8) or a range of IDs separated by a colon (e.g., 8:13)',
  })

  const recipientState = useInputState({
    id: 'recipient-address',
    name: 'recipient',
    title: 'Recipient Address',
    subtitle: 'Address of the recipient',
  })

  const whitelistState = useInputState({
    id: 'whitelist-address',
    name: 'whitelistAddress',
    title: 'Whitelist Address',
    subtitle: 'Address of the whitelist contract',
  })

  const showWhitelistField = type === 'set_whitelist'
  const showDateField = type === 'update_start_time'
  const showLimitField = type === 'update_per_address_limit'
  const showTokenIdField = isEitherType(type, ['transfer', 'mint_for', 'burn'])
  const showNumberOfTokensField = type === 'batch_mint'
  const showTokenIdListField = isEitherType(type, ['batch_burn', 'batch_transfer'])
  const showRecipientField = isEitherType(type, ['transfer', 'mint_to', 'mint_for', 'batch_mint', 'batch_transfer'])
  const showAirdropFileField = type === 'airdrop'

  const minterMessages = useMemo(
    () => minterContract?.use(minterContractState.value),
    [minterContract, minterContractState.value],
  )
  const sg721Messages = useMemo(
    () => sg721Contract?.use(sg721ContractState.value),
    [sg721Contract, sg721ContractState.value],
  )
  const payload: DispatchExecuteArgs = {
    whitelist: whitelistState.value,
    startTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
    limit: limitState.value,
    minterContract: minterContractState.value,
    sg721Contract: sg721ContractState.value,
    tokenId: tokenIdState.value,
    tokenIds: tokenIdListState.value,
    batchNumber: batchNumberState.value,
    minterMessages,
    sg721Messages,
    recipient: recipientState.value,
    recipients: airdropArray,
    txSigner: wallet.address,
    type,
  }
  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select an action!')
      }
      if (minterContractState.value === '' && sg721ContractState.value === '') {
        throw new Error('Please enter minter and sg721 contract addresses!')
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

  const airdropFileOnChange = (data: string[]) => {
    setAirdropArray(data)
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Collection Actions" />
      <ContractPageHeader
        description="Here you can execute various actions on a collection."
        link={links.Documentation}
        title="Collection Actions"
      />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...sg721ContractState} />
          <AddressInput {...minterContractState} />
          <ActionsCombobox {...comboboxState} />
          <QueryCombobox {...qcomboboxState} />
          {showRecipientField && <AddressInput {...recipientState} />}
          {showWhitelistField && <AddressInput {...whitelistState} />}
          {showLimitField && <NumberInput {...limitState} />}
          {showTokenIdField && <NumberInput {...tokenIdState} />}
          {showTokenIdListField && <TextInput {...tokenIdListState} />}
          {showNumberOfTokensField && <NumberInput {...batchNumberState} />}
          {showAirdropFileField && (
            <FormGroup subtitle="TXT file that contains the airdrop addresses" title="Airdrop File">
              <WhitelistUpload onChange={airdropFileOnChange} />
            </FormGroup>
          )}
          <Conditional test={showDateField}>
            <FormControl htmlId="start-date" subtitle="Start time for the minting" title="Start Time">
              <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
            </FormControl>
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
