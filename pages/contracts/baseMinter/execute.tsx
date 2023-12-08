import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/baseMinter/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/baseMinter/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput, TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { baseMinterLinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import { useGlobalSettings } from 'contexts/globalSettings'
import type { DispatchExecuteArgs } from 'contracts/baseMinter/messages/execute'
import { dispatchExecute, previewExecutePayload } from 'contracts/baseMinter/messages/execute'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { useWallet } from 'utils/wallet'

const BaseMinterExecutePage: NextPage = () => {
  const { baseMinter: contract } = useContracts()
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')
  const { timezone } = useGlobalSettings()

  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Base Minter Address',
    subtitle: 'Address of the Base Minter contract',
  })

  const tokenUriState = useInputState({
    id: 'token-uri',
    name: 'token-uri',
    title: 'Token URI',
    placeholder: 'ipfs://',
  })
  const contractAddress = contractState.value

  const showDateField = type === 'update_start_trading_time'
  const showTokenUriField = type === 'mint'

  const messages = useMemo(
    () => contract?.use(contractState.value),
    [contract, wallet.address, contractState.value, wallet.isWalletConnected],
  )
  const payload: DispatchExecuteArgs = {
    startTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
    tokenUri: tokenUriState.value,
    contract: contractState.value,
    messages,
    txSigner: wallet.address || '',
    type,
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
        toast.error(String(error), { style: { maxWidth: 'none' } })
      },
    },
  )

  const router = useRouter()

  useEffect(() => {
    if (contractAddress.length > 0) {
      void router.replace({ query: { contractAddress } })
    }
    if (contractAddress.length === 0) {
      void router.replace({ query: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress])
  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('contractAddress')
    if (initial && initial.length > 0) contractState.onChange(initial)
  }, [])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute Base Minter Contract" />
      <ContractPageHeader
        description="Base Minter contract facilitates 1/1 minting."
        link={links.Documentation}
        title="Base Minter Contract"
      />
      <LinkTabs activeIndex={2} data={baseMinterLinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          <Conditional test={showTokenUriField}>
            <TextInput {...tokenUriState} />
          </Conditional>
          <Conditional test={showDateField}>
            <FormControl
              htmlId="start-date"
              subtitle={`Start time for trading ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
              title="Trading Start Time"
            >
              <InputDateTime
                minDate={
                  timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
                }
                onChange={(date) =>
                  setTimestamp(
                    timezone === 'Local' ? date : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
                  )
                }
                value={
                  // eslint-disable-next-line no-nested-ternary
                  timezone === 'Local'
                    ? timestamp
                    : timestamp
                    ? new Date(timestamp.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                    : undefined
                }
              />
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

export default withMetadata(BaseMinterExecutePage, { center: false })
