import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import { Button } from 'components/Button'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { useExecuteComboboxState } from 'components/contracts/sg721/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { sg721LinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { MigrateResponse } from 'contracts/sg721'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { SG721_UPDATABLE_V1_CODE_ID } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const Sg721MigratePage: NextPage = () => {
  const { sg721: contract } = useContracts()
  const wallet = useWallet()

  const [lastTx, setLastTx] = useState('')

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id
  const codeIdState = useNumberInputState({
    id: 'code-id',
    name: 'code-id',
    title: 'Code ID',
    subtitle: 'Code ID of the New Sg721 contract',
    placeholder: '1',
    defaultValue: SG721_UPDATABLE_V1_CODE_ID,
  })

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Sg721 Address',
    subtitle: 'Address of the Sg721 contract',
  })
  const contractAddress = contractState.value

  const { data, isLoading, mutate } = useMutation(
    async (event: FormEvent): Promise<MigrateResponse | null> => {
      event.preventDefault()
      if (!contract) {
        throw new Error('Smart contract connection failed')
      }
      if (!wallet.initialized) {
        throw new Error('Please connect your wallet.')
      }

      const migrateMsg = {}
      return toast.promise(contract.migrate(contractAddress, codeIdState.value, migrateMsg), {
        error: `Migration failed!`,
        loading: 'Executing message...',
        success: (tx) => {
          if (tx) {
            setLastTx(tx.transactionHash)
          }
          return `Transaction success!`
        },
      })
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
      <NextSeo title="Migrate Sg721 Contract" />
      <ContractPageHeader
        description="Sg721 contract is a wrapper contract that has a set of optional extensions on top of cw721-base."
        link={links.Documentation}
        title="Sg721 Contract"
      />
      <LinkTabs activeIndex={3} data={sg721LinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <NumberInput isRequired {...codeIdState} />
          <Alert type="info">
            <div className="inline-block">
              Migrating a v1 contract to Code ID: {SG721_UPDATABLE_V1_CODE_ID} (sg721-updatable) will allow the creator
              to update the royalty details and token metadata. Once the migration is complete, new functionalities can
              be performed using{' '}
              <Anchor
                className="font-bold text-plumbus hover:underline"
                external
                href={`/collections/actions/?sg721ContractAddress=${contractState.value}`}
              >
                Collection Actions
              </Anchor>
              .
            </div>
          </Alert>
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
            <JsonPreview
              content={{
                sender: wallet.address,
                contract: contractAddress,
                code_id: codeIdState.value,
                msg: {},
              }}
              isCopyable
            />
          </FormControl>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(Sg721MigratePage, { center: false })
