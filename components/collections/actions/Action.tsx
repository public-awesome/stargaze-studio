import { AirdropUpload } from 'components/AirdropUpload'
import { Button } from 'components/Button'
import type { DispatchExecuteArgs } from 'components/collections/actions/actions'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'components/collections/actions/actions'
import { ActionsCombobox } from 'components/collections/actions/Combobox'
import { useActionsComboboxState } from 'components/collections/actions/Combobox.hooks'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { TransactionHash } from 'components/TransactionHash'
import { useWallet } from 'contexts/wallet'
import type { MinterInstance } from 'contracts/minter'
import type { SG721Instance } from 'contracts/sg721'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import type { AirdropAllocation } from 'utils/isValidAccountsFile'

import { TextInput } from '../../forms/FormInput'

interface CollectionActionsProps {
  minterContractAddress: string
  sg721ContractAddress: string
  sg721Messages: SG721Instance | undefined
  minterMessages: MinterInstance | undefined
}

export const CollectionActions = ({
  sg721ContractAddress,
  sg721Messages,
  minterContractAddress,
  minterMessages,
}: CollectionActionsProps) => {
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')

  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)
  const [airdropAllocationArray, setAirdropAllocationArray] = useState<AirdropAllocation[]>([])
  const [airdropArray, setAirdropArray] = useState<string[]>([])

  const actionComboboxState = useActionsComboboxState()
  const type = actionComboboxState.value?.id

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

  const payload: DispatchExecuteArgs = {
    whitelist: whitelistState.value,
    startTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
    limit: limitState.value,
    minterContract: minterContractAddress,
    sg721Contract: sg721ContractAddress,
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

  useEffect(() => {
    const addresses: string[] = []
    airdropAllocationArray.forEach((allocation) => {
      for (let i = 0; i < Number(allocation.amount); i++) {
        addresses.push(allocation.address)
      }
    })
    //shuffle the addresses array
    for (let i = addresses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[addresses[i], addresses[j]] = [addresses[j], addresses[i]]
    }
    setAirdropArray(addresses)
  }, [airdropAllocationArray])

  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select an action!')
      }
      if (minterContractAddress === '' && sg721ContractAddress === '') {
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

  const airdropFileOnChange = (data: AirdropAllocation[]) => {
    setAirdropAllocationArray(data)
    console.log(data)
  }

  return (
    <form>
      <div className="grid grid-cols-2 mt-4">
        <div className="mr-2">
          <ActionsCombobox {...actionComboboxState} />
          {showRecipientField && <AddressInput {...recipientState} />}
          {showWhitelistField && <AddressInput {...whitelistState} />}
          {showLimitField && <NumberInput {...limitState} />}
          {showTokenIdField && <NumberInput {...tokenIdState} />}
          {showTokenIdListField && <TextInput {...tokenIdListState} />}
          {showNumberOfTokensField && <NumberInput {...batchNumberState} />}
          {showAirdropFileField && (
            <FormGroup
              subtitle="CSV file that contains the airdrop addresses and the amount of tokens allocated for each address. Should start with the following header row: address,amount"
              title="Airdrop File"
            >
              <AirdropUpload onChange={airdropFileOnChange} />
            </FormGroup>
          )}
          <Conditional test={showDateField}>
            <FormControl htmlId="start-date" subtitle="Start time for the minting" title="Start Time">
              <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
            </FormControl>
          </Conditional>
        </div>
        <div className="-mt-6">
          <div className="relative mb-2">
            <Button
              className="absolute top-0 right-0"
              isLoading={isLoading}
              onClick={mutate}
              rightIcon={<FaArrowRight />}
            >
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
      </div>
    </form>
  )
}
