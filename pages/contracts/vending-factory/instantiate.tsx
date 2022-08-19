import { coin } from '@cosmjs/proto-signing'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { FormTextArea } from 'components/forms/FormTextArea'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { minterLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { InstantiateResponse } from 'contracts/minter'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { MINTER_CODE_ID } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const MinterInstantiatePage: NextPage = () => {
  const wallet = useWallet()
  const contract = useContracts().minter

  const [startDate, setStartDate] = useState<Date | undefined>(undefined)

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

  const codeIdState = useNumberInputState({
    id: 'code-id',
    name: 'code-id',
    title: 'Code ID',
    subtitle: 'Code ID for the sg721 contract',
    placeholder: '1',
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

  const unitPriceState = useNumberInputState({
    id: 'unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: 'Price of each tokens in collection',
    placeholder: '500',
  })

  const baseTokenUriState = useInputState({
    id: 'base-token-uri',
    name: 'baseTokenUri',
    title: 'Base Token URI',
    subtitle: 'IPFS uri for the tokens',
    placeholder: 'ipfs://bafybe....',
  })

  const tokenNumberState = useNumberInputState({
    id: 'token-number',
    name: 'tokenNumber',
    title: 'Token Amount',
    subtitle: 'Number of tokens in collection',
    placeholder: '1000',
  })

  const perAddressLimitState = useNumberInputState({
    id: 'per-address-limit',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Limit of tokens per address',
    placeholder: '5',
  })

  const whitelistAddressState = useInputState({
    id: 'whitelist-address',
    name: 'whitelistAddress',
    title: 'Whitelist Address',
    subtitle: 'Address to whitelist contract',
    placeholder: 'stars1234567890abcdefghijklmnopqrstuvwxyz...',
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

      if (tokenNumberState.value < 1 || tokenNumberState.value > 10000) {
        throw new Error('Token amount must be between 1 and 10000')
      }

      if (perAddressLimitState.value < 1 || perAddressLimitState.value > 50) {
        throw new Error('Per address limit must be between 1 and 50')
      }

      if (Number(unitPriceState.value) < 500) {
        throw new Error('Unit price must be greater than 500 STARS')
      }

      if (!startDate) {
        throw new Error('Start date is required')
      }

      const msg = {
        base_token_uri: baseTokenUriState.value,
        num_tokens: tokenNumberState.value,
        sg721_code_id: codeIdState.value,
        sg721_instantiate_msg: {
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
        },
        per_address_limit: perAddressLimitState.value,
        unit_price: coin(String(Number(unitPriceState.value) * 1000000), 'ustars'),
        whitelist_address: whitelistAddressState.value || null,
        start_time: (startDate.getTime() * 1_000_000).toString(),
      }
      return toast.promise(contract.instantiate(MINTER_CODE_ID, msg, 'Stargaze Minter Contract', wallet.address), {
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

  const txHash = data?.transactionHash

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={mutate}>
      <NextSeo title="Instantiate Minter Contract" />
      <ContractPageHeader
        description="Minter contract facilitates primary market vending machine style minting."
        link={links.Documentation}
        title="Minter Contract"
      />
      <LinkTabs activeIndex={0} data={minterLinkTabs} />

      <Conditional test={Boolean(data)}>
        <Alert type="info">
          <b>Instantiate success!</b> Here is the transaction result containing the contract address and the transaction
          hash.
        </Alert>
        <JsonPreview content={data} title="Transaction Result" />
        <br />
      </Conditional>

      <FormGroup subtitle="Information about your sg721 contract" title="SG721 Contract Details">
        <NumberInput isRequired {...codeIdState} />
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

      <FormGroup subtitle="Information about your minting settings" title="Minting Details">
        <NumberInput isRequired {...unitPriceState} />
        <TextInput isRequired {...baseTokenUriState} />
        <NumberInput isRequired {...tokenNumberState} />
        <NumberInput isRequired {...perAddressLimitState} />
        <FormControl htmlId="start-date" isRequired subtitle="Start time for the minting" title="Start Time">
          <InputDateTime minDate={new Date()} onChange={(date) => setStartDate(date)} value={startDate} />
        </FormControl>
        <TextInput {...whitelistAddressState} />
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

export default withMetadata(MinterInstantiatePage, { center: false })
