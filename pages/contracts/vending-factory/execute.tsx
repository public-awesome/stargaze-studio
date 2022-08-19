import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/vending-factory/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/vending-factory/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { minterLinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { DispatchExecuteArgs } from 'contracts/vending-factory/messages/execute'
import { dispatchExecute, previewExecutePayload } from 'contracts/vending-factory/messages/execute'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const VendingFactoryExecutePage: NextPage = () => {
  const { vendingFactory: contract } = useContracts()
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id
  //VendingMinterInitMsg
  const baseTokenUriState = useInputState({
    id: 'base-token-uri',
    name: 'baseTokenUri',
    title: 'Base Token URI',
    subtitle: 'IPFS URI for the tokens',
    placeholder: 'ipfs://...',
  })

  const [startDate, setStartDate] = useState<Date | undefined>(undefined)

  const tokenNumberState = useNumberInputState({
    id: 'token-number',
    name: 'tokenNumber',
    title: 'Token Amount',
    subtitle: 'Number of tokens in collection',
    placeholder: '1000',
  })

  const priceState = useNumberInputState({
    id: 'price',
    name: 'price',
    title: 'Price',
    subtitle: 'Enter the token price',
  })

  const limitState = useNumberInputState({
    id: 'per-address-limi',
    name: 'perAddressLimit',
    title: 'Per Address Limit',
    subtitle: 'Enter the per address limit',
  })

  const whitelistState = useInputState({
    id: 'whitelist-address',
    name: 'whitelistAddress',
    title: 'Whitelist Address',
    subtitle: 'Address of the whitelist contract',
  })

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Minter Address',
    subtitle: 'Address of the Vending Factory contract',
    defaultValue: 'stars1...',
  })
  //CollectionParameters
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

  const codeIdState = useNumberInputState({
    id: 'code-id',
    name: 'code-id',
    title: 'Code ID',
    subtitle: 'Code ID for the sg721 contract',
    placeholder: '1',
  })

  //Collection Info
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
  //RoyaltyInfo
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

  const showWhitelistField = type === 'create_minter'
  const showDateField = type === 'create_minter'
  const showLimitField = type === 'create_minter'
  const showPriceField = type === 'create_minter'
  const showTokenNumberField = type === 'create_minter'
  const showBaseTokenUriField = type === 'create_minter'
  const showNameField = type === 'create_minter'
  const showSymbolField = type === 'create_minter'
  const showCodeIdField = type === 'create_minter'
  const showCreatorField = type === 'create_minter'
  const showDescriptionField = type === 'create_minter'
  const showImageField = type === 'create_minter'
  const showExternalLinkField = type === 'create_minter'
  const showRoyaltyPaymentAddressField = type === 'create_minter'
  const showRoyaltyShareField = type === 'create_minter'
  const showContractField = type === 'create_minter'

  const messages = useMemo(() => contract?.use(contractState.value), [contract, wallet.address, contractState.value])
  const payload: DispatchExecuteArgs = {
    contract: contractState.value,
    messages,
    txSigner: wallet.address,
    type: 'create_minter',
    msg: {
      init_msg: {
        base_token_uri: baseTokenUriState.value,
        start_time: startDate ? (startDate.getTime() * 1000000).toString() : '',
        num_tokens: tokenNumberState.value,
        unit_price: { denom: 'stars', amount: priceState.value.toString() },
        per_address_limit: limitState.value,
        whitelist: whitelistState.value,
      },
      collection_params: {
        code_id: codeIdState.value,
        name: nameState.value,
        symbol: symbolState.value,
        info: {
          creator: creatorState.value,
          description: descriptionState.value,
          image: imageState.value,
          external_link: externalLinkState.value,
          royalty_info: {
            payment_address: royaltyPaymentAddressState.value,
            share: (royaltyShareState.value / 100).toString(),
          },
        },
      },
    },
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
          {showContractField && <AddressInput {...contractState} />}
          {showWhitelistField && <AddressInput {...whitelistState} />}
          {showLimitField && <NumberInput {...limitState} />}
          {showCodeIdField && <NumberInput {...codeIdState} />}
          {showPriceField && <NumberInput {...priceState} />}
          {showImageField && <TextInput {...imageState} />}
          {showCreatorField && <AddressInput {...creatorState} />}
          {showDescriptionField && <TextInput {...descriptionState} />}
          {showSymbolField && <TextInput {...symbolState} />}
          {showNameField && <TextInput {...nameState} />}
          {showTokenNumberField && <NumberInput {...tokenNumberState} />}
          {showBaseTokenUriField && <TextInput {...baseTokenUriState} />}
          {showExternalLinkField && <TextInput {...externalLinkState} />}
          {showRoyaltyPaymentAddressField && <AddressInput {...royaltyPaymentAddressState} />}
          {showRoyaltyShareField && <NumberInput {...royaltyShareState} />}
          {/* TODO: Fix address execute message */}
          <Conditional test={showDateField}>
            <FormControl htmlId="start-date" subtitle="Start time for the minting" title="Start Time">
              <InputDateTime minDate={new Date()} onChange={(date) => setStartDate(date)} value={startDate} />
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

export default withMetadata(VendingFactoryExecutePage, { center: false })
