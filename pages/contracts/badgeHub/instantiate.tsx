import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormGroup } from 'components/FormGroup'
import { NumberInput } from 'components/forms/FormInput'
import { useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { badgeHubLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { InstantiateResponse } from 'contracts/sg721'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { type FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { BADGE_HUB_CODE_ID } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

export interface FeeRate {
  metadata: number
  key: number
}

const BadgeHubInstantiatePage: NextPage = () => {
  const wallet = useWallet()
  const { badgeHub: contract } = useContracts()

  const metadataFeeRateState = useNumberInputState({
    id: 'metadata-fee-rate',
    name: 'Metadata Fee Rate',
    title: 'Metadata Fee Rate',
    subtitle: 'The fee rate, in ustars per byte, for storing metadata on-chain',
    placeholder: '500',
  })

  const keyFeeRateState = useNumberInputState({
    id: 'key-fee-rate',
    name: 'Key Fee Rate',
    title: 'Key Fee Rate',
    subtitle: 'The fee rate, in ustars per byte, for storing claim keys on-chain',
    placeholder: '500',
  })

  const { data, isLoading, mutate } = useMutation(
    async (event: FormEvent): Promise<InstantiateResponse | null> => {
      event.preventDefault()
      if (!contract) {
        throw new Error('Smart contract connection failed')
      }

      if (!keyFeeRateState.value) {
        throw new Error('Key fee rate is required')
      }
      if (!metadataFeeRateState.value) {
        throw new Error('Metadata fee rate is required')
      }

      const msg = {
        fee_rate: {
          metadata: metadataFeeRateState.value.toString(),
          key: keyFeeRateState.value.toString(),
        },
      }
      return toast.promise(
        contract.instantiate(BADGE_HUB_CODE_ID, msg, 'Stargaze Badge Hub Contract', wallet.address),
        {
          loading: 'Instantiating contract...',
          error: 'Instantiation failed!',
          success: 'Instantiation success!',
        },
      )
    },
    {
      onError: (error) => {
        toast.error(String(error), { style: { maxWidth: 'none' } })
      },
    },
  )

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={mutate}>
      <NextSeo title="Instantiate Badge Hub Contract" />
      <ContractPageHeader
        description="The badge-hub contract is where event organizers create, mint, or edit badges."
        link={links.Documentation}
        title="Badge Hub Contract"
      />
      <LinkTabs activeIndex={0} data={badgeHubLinkTabs} />

      <Conditional test={Boolean(data)}>
        <Alert type="info">
          <b>Instantiate success!</b> Here is the transaction result containing the contract address and the transaction
          hash.
        </Alert>
        <JsonPreview content={data} title="Transaction Result" />
        <br />
      </Conditional>

      <FormGroup subtitle title="Fee Rate Details">
        <NumberInput isRequired {...metadataFeeRateState} />
        <NumberInput isRequired {...keyFeeRateState} />
      </FormGroup>

      <div className="flex items-center p-4">
        <div className="flex-grow" />
        <Button isLoading={isLoading} isWide rightIcon={<FaAsterisk />} type="submit">
          Instantiate Contract
        </Button>
      </div>
    </form>
  )
}

export default withMetadata(BadgeHubInstantiatePage, { center: false })
