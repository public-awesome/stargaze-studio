import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormGroup } from 'components/FormGroup'
import { NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { FormTextArea } from 'components/forms/FormTextArea'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { sg721LinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { InstantiateResponse } from 'contracts/sg721'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { SG721_CODE_ID } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const Sg721InstantiatePage: NextPage = () => {
  const wallet = useWallet()
  const contract = useContracts().sg721

  const nameState = useInputState({
    id: 'name',
    name: 'name',
    title: 'Name',
    placeholder: 'My Awesome SG721 Contract',
    subtitle: 'Name of the sg721 contract',
  })

  const symbolState = useInputState({
    id: 'symbol',
    name: 'symbol',
    title: 'Symbol',
    placeholder: 'AWSM',
    subtitle: 'Symbol of the sg721 contract',
  })

  const minterState = useInputState({
    id: 'minter-address',
    name: 'minterAddress',
    title: 'Minter Address',
    placeholder: 'stars1234567890abcdefghijklmnopqrstuvwxyz...',
    subtitle: 'Address that has the permissions to mint on sg721 contract',
  })

  const creatorState = useInputState({
    id: 'creator-address',
    name: 'creatorAddress',
    title: 'Creator Address',
    placeholder: 'stars1234567890abcdefghijklmnopqrstuvwxyz...',
    subtitle: 'Address of the collection creator',
  })

  const descriptionState = useInputState({
    id: 'description',
    name: 'description',
    title: 'Description',
    subtitle: 'Description of the collection',
  })

  const imageState = useInputState({
    id: 'image',
    name: 'image',
    title: 'Image',
    subtitle: 'Image of the collection',
    placeholder: 'ipfs://bafybe....',
  })

  const externalLinkState = useInputState({
    id: 'external-link',
    name: 'externalLink',
    title: 'External Link',
    subtitle: 'External link to the collection',
  })

  const royaltyPaymentAddressState = useInputState({
    id: 'royalty-payment-address',
    name: 'royaltyPaymentAddress',
    title: 'Payment Address',
    subtitle: 'Address to receive royalties',
    placeholder: 'stars1234567890abcdefghijklmnopqrstuvwxyz...',
  })

  const royaltyShareState = useNumberInputState({
    id: 'royalty-share',
    name: 'royaltyShare',
    title: 'Share Percentage',
    subtitle: 'Percentage of royalties to be paid',
    placeholder: '8',
  })

  const { data, isLoading, mutate } = useMutation(
    async (event: FormEvent): Promise<InstantiateResponse | null> => {
      event.preventDefault()
      if (!contract) {
        throw new Error('Smart contract connection failed')
      }

      let royaltyInfo = null
      if (royaltyPaymentAddressState.value && royaltyShareState.value) {
        royaltyInfo = {
          paymentAddress: royaltyPaymentAddressState.value,
          share: royaltyShareState.value,
        }
      }

      const msg = {
        name: nameState.value,
        symbol: symbolState.value,
        minter: minterState.value,
        collection_info: {
          creator: creatorState.value,
          description: descriptionState.value,
          image: imageState.value,
          external_link: externalLinkState.value || null,
          royalty_info: royaltyInfo,
        },
      }
      return toast.promise(contract.instantiate(SG721_CODE_ID, msg, 'Stargaze Sg721 Contract', wallet.address), {
        loading: 'Instantiating contract...',
        error: 'Instantiation failed!',
        success: 'Instantiation success!',
      })
    },
    {
      onError: (error) => {
        toast.error(String(error))
      },
    },
  )

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={mutate}>
      <NextSeo title="Instantiate Sg721 Contract" />
      <ContractPageHeader
        description="Sg721 contract is a wrapper contract that has a set of optional extensions on top of cw721-base."
        link={links.Documentation}
        title="Sg721 Contract"
      />
      <LinkTabs activeIndex={0} data={sg721LinkTabs} />

      <Conditional test={Boolean(data)}>
        <Alert type="info">
          <b>Instantiate success!</b> Here is the transaction result containing the contract address and the transaction
          hash.
        </Alert>
        <JsonPreview content={data} title="Transaction Result" />
        <br />
      </Conditional>

      <FormGroup subtitle="Information about your sg721 contract" title="SG721 Contract Details">
        <TextInput isRequired {...nameState} />
        <TextInput isRequired {...symbolState} />
        <TextInput isRequired {...minterState} />
      </FormGroup>

      <FormGroup subtitle="Information about your collection" title="Collection Details">
        <TextInput isRequired {...creatorState} />
        <FormTextArea isRequired {...descriptionState} />
        <TextInput isRequired {...imageState} />
        <TextInput {...externalLinkState} />
      </FormGroup>

      <FormGroup subtitle="Information about royalty" title="Royalty Details">
        <TextInput {...royaltyPaymentAddressState} />
        <NumberInput {...royaltyShareState} />
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

export default withMetadata(Sg721InstantiatePage, { center: false })
