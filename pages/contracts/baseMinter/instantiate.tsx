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
import { baseMinterLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { BASE_FACTORY_ADDRESS } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

import type { CreateBaseMinterResponse } from '../../../contracts/baseFactory/contract'
import { SG721_CODE_ID } from '../../../utils/constants'
import { resolveAddress } from '../../../utils/resolveAddress'

const BaseMinterInstantiatePage: NextPage = () => {
  const wallet = useWallet()
  const contract = useContracts().baseFactory

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
    defaultValue: SG721_CODE_ID,
  })

  const creatorState = useInputState({
    id: 'creator-address',
    name: 'creatorAddress',
    title: 'Creator Address',
    placeholder: 'stars1234567890abcdefghijklmnopqrstuvwxyz...',
    subtitle: 'Address of the collection creator',
    defaultValue: wallet.address,
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
    title: 'External Link (optional)',
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
    placeholder: '8%',
  })

  const { data, isLoading, mutate } = useMutation(
    async (event: FormEvent): Promise<CreateBaseMinterResponse | null> => {
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

      const msg = {
        create_minter: {
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
          .use(BASE_FACTORY_ADDRESS)
          ?.createBaseMinter(wallet.address, msg, [coin('1000000000', 'ustars')]) as Promise<CreateBaseMinterResponse>,
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
      <NextSeo title="Instantiate Base Minter Contract" />
      <ContractPageHeader
        description="Base Minter contract facilitates 1/1 minting."
        link={links.Documentation}
        title="Base Minter Contract"
      />
      <LinkTabs activeIndex={0} data={baseMinterLinkTabs} />

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
        <FormControl htmlId="timestamp" subtitle="Trading start time (local)" title="Trading Start Time (optional)">
          <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
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

      <FormGroup subtitle="Information about royalty" title="Royalty Details (optional)">
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

export default withMetadata(BaseMinterInstantiatePage, { center: false })
