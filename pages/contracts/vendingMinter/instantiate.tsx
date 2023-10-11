/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */
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
import { vendingMinterLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useGlobalSettings } from 'contexts/globalSettings'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { VENDING_FACTORY_ADDRESS } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { resolveAddress } from 'utils/resolveAddress'
import { useWallet } from 'utils/wallet'

import type { CreateVendingMinterResponse } from '../../../contracts/vendingFactory/contract'

const VendingMinterInstantiatePage: NextPage = () => {
  const wallet = useWallet()
  const contract = useContracts().vendingFactory
  const { timezone } = useGlobalSettings()

  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [timestamp, setTimestamp] = useState<Date | undefined>()
  const [explicit, setExplicit] = useState<boolean>(false)

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

  const royaltyShareState = useInputState({
    id: 'royalty-share',
    name: 'royaltyShare',
    title: 'Share Percentage',
    subtitle: 'Percentage of royalties to be paid',
    placeholder: '5%',
  })

  const unitPriceState = useNumberInputState({
    id: 'unit-price',
    name: 'unitPrice',
    title: 'Unit Price',
    subtitle: 'Price of each tokens in collection',
    placeholder: '50',
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
    async (event: FormEvent): Promise<CreateVendingMinterResponse | null> => {
      event.preventDefault()
      if (!contract) {
        throw new Error('Smart contract connection failed')
      }

      let royaltyInfo = null
      if (royaltyPaymentAddressState.value && royaltyShareState.value) {
        royaltyInfo = {
          payment_address: royaltyPaymentAddressState.value,
          share: (Number(royaltyShareState.value) / 100).toString(),
        }
      }

      if (tokenNumberState.value < 1 || tokenNumberState.value > 10000) {
        throw new Error('Token amount must be between 1 and 10000')
      }

      if (perAddressLimitState.value < 1 || perAddressLimitState.value > 50) {
        throw new Error('Per address limit must be between 1 and 50')
      }

      if (Number(unitPriceState.value) < 50) {
        throw new Error('Unit price must be greater than 50 STARS')
      }

      if (!startDate) {
        throw new Error('Start date is required')
      }

      const msg = {
        create_minter: {
          init_msg: {
            base_token_uri: baseTokenUriState.value,
            start_time: (startDate.getTime() * 1_000_000).toString(),
            num_tokens: tokenNumberState.value,
            mint_price: coin(String(Number(unitPriceState.value) * 1000000), 'ustars'),
            per_address_limit: perAddressLimitState.value,
            whitelist: whitelistAddressState.value || null,
          },
          collection_params: {
            code_id: codeIdState.value,
            name: nameState.value,
            symbol: symbolState.value,
            info: {
              creator: creatorState.value,
              description: descriptionState.value,
              image: imageState.value,
              external_link: externalLinkState.value || null,
              explicit_content: explicit,
              start_trading_time: timestamp ? (timestamp.getTime() * 1_000_000).toString() : null,
              royalty_info: royaltyInfo,
            },
          },
        },
      }

      return toast.promise(
        contract
          .use(VENDING_FACTORY_ADDRESS)
          ?.createVendingMinter(wallet.address || '', msg, [
            coin('3000000000', 'ustars'),
          ]) as Promise<CreateVendingMinterResponse>,
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
  const txHash = data?.transactionHash

  useEffect(() => {
    void resolveAddress(creatorState.value, wallet).then((resolvedAddress) => {
      creatorState.onChange(resolvedAddress)
    })
  }, [creatorState.value])

  useEffect(() => {
    void resolveAddress(royaltyPaymentAddressState.value, wallet).then((resolvedAddress) => {
      royaltyPaymentAddressState.onChange(resolvedAddress)
    })
  }, [royaltyPaymentAddressState.value])

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={mutate}>
      <NextSeo title="Instantiate Vending Minter Contract" />
      <ContractPageHeader
        description="Vending Minter contract facilitates primary market vending machine style minting."
        link={links.Documentation}
        title="Vending Minter Contract"
      />
      <LinkTabs activeIndex={0} data={vendingMinterLinkTabs} />

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
      </FormGroup>

      <FormGroup subtitle="Information about your collection" title="Collection Details">
        <TextInput isRequired {...creatorState} />
        <FormTextArea isRequired {...descriptionState} />
        <TextInput isRequired {...imageState} />
        <TextInput {...externalLinkState} />
        <FormControl
          htmlId="start-date"
          subtitle={`Start time for trading ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
          title="Trading Start Time (optional)"
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
              timezone === 'Local'
                ? timestamp
                : timestamp
                ? new Date(timestamp.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                : undefined
            }
          />
        </FormControl>
        <div className="flex flex-col space-y-2">
          <div>
            <div className="flex">
              <span className="mt-1 text-sm first-letter:capitalize">
                Does the collection contain explicit content?
              </span>
              <div className="ml-2 font-bold form-check form-check-inline">
                <input
                  checked={explicit}
                  className="peer sr-only"
                  id="explicitRadio1"
                  name="explicitRadioOptions1"
                  onClick={() => {
                    setExplicit(true)
                  }}
                  type="radio"
                />
                <label
                  className="inline-block py-1 px-2 text-sm text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                  htmlFor="explicitRadio1"
                >
                  YES
                </label>
              </div>
              <div className="ml-2 font-bold form-check form-check-inline">
                <input
                  checked={!explicit}
                  className="peer sr-only"
                  id="explicitRadio2"
                  name="explicitRadioOptions2"
                  onClick={() => {
                    setExplicit(false)
                  }}
                  type="radio"
                />
                <label
                  className="inline-block py-1 px-2 text-sm text-gray peer-checked:text-white hover:text-white peer-checked:bg-black hover:rounded-sm peer-checked:border-b-2 hover:border-b-2 peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
                  htmlFor="explicitRadio2"
                >
                  NO
                </label>
              </div>
            </div>
          </div>
        </div>
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
        <FormControl
          htmlId="start-date"
          isRequired
          subtitle={`Minting start time ${timezone === 'Local' ? '(local)' : '(UTC)'}`}
          title="Start Time"
        >
          <InputDateTime
            minDate={
              timezone === 'Local' ? new Date() : new Date(Date.now() + new Date().getTimezoneOffset() * 60 * 1000)
            }
            onChange={(date) =>
              setStartDate(
                timezone === 'Local' ? date : new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000),
              )
            }
            value={
              timezone === 'Local'
                ? startDate
                : startDate
                ? new Date(startDate.getTime() + new Date().getTimezoneOffset() * 60 * 1000)
                : undefined
            }
          />
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

export default withMetadata(VendingMinterInstantiatePage, { center: false })
