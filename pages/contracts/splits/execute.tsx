import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/splits/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/splits/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { splitsLinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import type { DispatchExecuteArgs } from 'contracts/splits/messages/execute'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'contracts/splits/messages/execute'
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

const SplitsExecutePage: NextPage = () => {
  const { splits: contract } = useContracts()
  const wallet = useWallet()

  const [lastTx, setLastTx] = useState('')

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Splits Address',
    subtitle: 'Address of the Splits contract',
  })
  const contractAddress = contractState.value

  const adminAddressState = useInputState({
    id: 'admin-address',
    name: 'admin-address',
    title: 'Admin Address',
    subtitle: 'Address of the new administrator',
  })

  const showAdminAddress = isEitherType(type, ['update_admin'])

  const messages = useMemo(() => contract?.use(contractState.value), [contract, contractState.value])
  const payload: DispatchExecuteArgs = {
    contract: contractState.value,
    messages,
    type,
    admin: adminAddressState.value.trim(),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress])
  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('contractAddress')
    if (initial && initial.length > 0) contractState.onChange(initial)
  }, [])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute Splits Contract" />
      <ContractPageHeader
        description="Splits contract distributes funds to a cw4-group based on member weights."
        link={links.Documentation}
        title="Splits Contract"
      />
      <LinkTabs activeIndex={2} data={splitsLinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          <Conditional test={showAdminAddress}>
            <AddressInput {...adminAddressState} />
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

export default withMetadata(SplitsExecutePage, { center: false })
