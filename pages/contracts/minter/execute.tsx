import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/minter/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/minter/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { minterLinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { DispatchExecuteArgs } from 'contracts/minter/messages/execute'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'contracts/minter/messages/execute'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const MinterExecutePage: NextPage = () => {
  const { minter: contract } = useContracts()
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')

  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

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

  const priceState = useNumberInputState({
    id: 'price',
    name: 'price',
    title: 'Price',
    subtitle: 'Enter the token price',
  })

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Minter Address',
    subtitle: 'Address of the Minter contract',
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
  const showTokenIdField = type === 'mint_for'
  const showRecipientField = isEitherType(type, ['mint_to', 'mint_for'])
  const showPriceField = type === 'mint'

  const messages = useMemo(() => contract?.use(contractState.value), [contract, wallet.address, contractState.value])
  const payload: DispatchExecuteArgs = {
    whitelist: whitelistState.value,
    startTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
    limit: limitState.value,
    contract: contractState.value,
    tokenId: tokenIdState.value,
    messages,
    recipient: recipientState.value,
    txSigner: wallet.address,
    price: priceState.value ? (Number(priceState.value) * 1_000_000).toString() : '0',
    type,
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
      <NextSeo title="Execute Minter Contract" />
      <ContractPageHeader
        description="Minter contract facilitates primary market vending machine style minting."
        link={links.Documentation}
        title="Minter Contract"
      />
      <LinkTabs activeIndex={2} data={minterLinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          {showRecipientField && <AddressInput {...recipientState} />}
          {showWhitelistField && <AddressInput {...whitelistState} />}
          {showLimitField && <NumberInput {...limitState} />}
          {showTokenIdField && <NumberInput {...tokenIdState} />}
          {showPriceField && <NumberInput {...priceState} />}
          {/* TODO: Fix address execute message */}
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

export default withMetadata(MinterExecutePage, { center: false })
