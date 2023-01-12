import { AirdropUpload } from 'components/AirdropUpload'
import { Button } from 'components/Button'
import type { DispatchExecuteArgs } from 'components/collections/actions/actions'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'components/collections/actions/actions'
import { ActionsCombobox } from 'components/collections/actions/Combobox'
import { useActionsComboboxState } from 'components/collections/actions/Combobox.hooks'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { TransactionHash } from 'components/TransactionHash'
import { useWallet } from 'contexts/wallet'
import type { BaseMinterInstance } from 'contracts/baseMinter'
import type { SG721Instance } from 'contracts/sg721'
import type { VendingMinterInstance } from 'contracts/vendingMinter'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import type { AirdropAllocation } from 'utils/isValidAccountsFile'
import { resolveAddress } from 'utils/resolveAddress'

import type { CollectionInfo } from '../../../contracts/sg721/contract'
import { TextInput } from '../../forms/FormInput'
import type { MinterType } from './Combobox'

interface CollectionActionsProps {
  minterContractAddress: string
  sg721ContractAddress: string
  sg721Messages: SG721Instance | undefined
  vendingMinterMessages: VendingMinterInstance | undefined
  baseMinterMessages: BaseMinterInstance | undefined
  minterType: MinterType
}

type ExplicitContentType = true | false | undefined

export const CollectionActions = ({
  sg721ContractAddress,
  sg721Messages,
  minterContractAddress,
  vendingMinterMessages,
  baseMinterMessages,
  minterType,
}: CollectionActionsProps) => {
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')

  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)
  const [airdropAllocationArray, setAirdropAllocationArray] = useState<AirdropAllocation[]>([])
  const [airdropArray, setAirdropArray] = useState<string[]>([])
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>()
  const [explicitContent, setExplicitContent] = useState<ExplicitContentType>(undefined)
  const [resolvedRecipientAddress, setResolvedRecipientAddress] = useState<string>('')

  const actionComboboxState = useActionsComboboxState()
  const type = actionComboboxState.value?.id

  const limitState = useNumberInputState({
    id: 'per-address-limit',
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

  const batchNumberState = useNumberInputState({
    id: 'batch-number',
    name: 'batchNumber',
    title: 'Number of Tokens',
    subtitle: 'Enter the number of tokens to mint',
  })

  const tokenIdListState = useInputState({
    id: 'token-id-list',
    name: 'tokenIdList',
    title: 'List of token IDs',
    subtitle:
      'Specify individual token IDs separated by commas (e.g., 2, 4, 8) or a range of IDs separated by a colon (e.g., 8:13)',
  })

  const recipientState = useInputState({
    id: 'recipient-address',
    name: 'recipient',
    title: 'Recipient Address',
    subtitle: 'Address of the recipient',
  })

  const tokenURIState = useInputState({
    id: 'token-uri',
    name: 'tokenURI',
    title: 'Token URI',
    subtitle: 'URI for the token to be minted',
    placeholder: 'ipfs://',
  })

  const whitelistState = useInputState({
    id: 'whitelist-address',
    name: 'whitelistAddress',
    title: 'Whitelist Address',
    subtitle: 'Address of the whitelist contract',
  })

  const priceState = useNumberInputState({
    id: 'update-mint-price',
    name: 'updateMintPrice',
    title: 'Update Mint Price',
    subtitle: 'New minting price in STARS',
  })

  const descriptionState = useInputState({
    id: 'collection-description',
    name: 'description',
    title: 'Collection Description',
  })

  const imageState = useInputState({
    id: 'collection-cover-image',
    name: 'cover_image',
    title: 'Collection Cover Image',
    subtitle: 'URL for collection cover image.',
  })

  const externalLinkState = useInputState({
    id: 'collection-ext-link',
    name: 'external_link',
    title: 'External Link',
    subtitle: 'External URL for the collection.',
  })

  const royaltyPaymentAddressState = useInputState({
    id: 'royalty-payment-address',
    name: 'royaltyPaymentAddress',
    title: 'Royalty Payment Address',
    subtitle: 'Address to receive royalties.',
    placeholder: 'stars1234567890abcdefghijklmnopqrstuvwxyz...',
  })

  const royaltyShareState = useInputState({
    id: 'royalty-share',
    name: 'royaltyShare',
    title: 'Share Percentage',
    subtitle: 'Percentage of royalties to be paid',
    placeholder: '8%',
  })

  const showTokenUriField = type === 'mint_token_uri'
  const showWhitelistField = type === 'set_whitelist'
  const showDateField = isEitherType(type, ['update_start_time', 'update_start_trading_time'])
  const showLimitField = type === 'update_per_address_limit'
  const showTokenIdField = isEitherType(type, ['transfer', 'mint_for', 'burn'])
  const showNumberOfTokensField = type === 'batch_mint'
  const showTokenIdListField = isEitherType(type, ['batch_burn', 'batch_transfer', 'batch_mint_for'])
  const showRecipientField = isEitherType(type, [
    'transfer',
    'mint_to',
    'mint_for',
    'batch_mint',
    'batch_transfer',
    'batch_mint_for',
  ])
  const showAirdropFileField = type === 'airdrop'
  const showPriceField = type === 'update_mint_price'
  const showDescriptionField = type === 'update_collection_info'
  const showImageField = type === 'update_collection_info'
  const showExternalLinkField = type === 'update_collection_info'
  const showRoyaltyRelatedFields = type === 'update_collection_info'
  const showExplicitContentField = type === 'update_collection_info'

  const payload: DispatchExecuteArgs = {
    whitelist: whitelistState.value,
    startTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
    limit: limitState.value,
    minterContract: minterContractAddress,
    sg721Contract: sg721ContractAddress,
    tokenId: tokenIdState.value,
    tokenIds: tokenIdListState.value,
    tokenUri: tokenURIState.value,
    batchNumber: batchNumberState.value,
    vendingMinterMessages,
    baseMinterMessages,
    sg721Messages,
    recipient: resolvedRecipientAddress,
    recipients: airdropArray,
    txSigner: wallet.address,
    type,
    price: priceState.value.toString(),
    collectionInfo,
  }
  const resolveRecipientAddress = async () => {
    await resolveAddress(recipientState.value.trim(), wallet).then((resolvedAddress) => {
      setResolvedRecipientAddress(resolvedAddress)
    })
  }
  useEffect(() => {
    void resolveRecipientAddress()
  }, [recipientState.value])

  const resolveRoyaltyPaymentAddress = async () => {
    await resolveAddress(royaltyPaymentAddressState.value.trim(), wallet).then((resolvedAddress) => {
      setCollectionInfo({
        description: descriptionState.value || undefined,
        image: imageState.value || undefined,
        explicit_content: explicitContent,
        external_link: externalLinkState.value || undefined,
        royalty_info:
          royaltyPaymentAddressState.value && royaltyShareState.value
            ? {
                payment_address: resolvedAddress,
                share: (Number(royaltyShareState.value) / 100).toString(),
              }
            : undefined,
      })
    })
  }

  useEffect(() => {
    void resolveRoyaltyPaymentAddress()
  }, [royaltyPaymentAddressState.value])

  useEffect(() => {
    setCollectionInfo({
      description: descriptionState.value || undefined,
      image: imageState.value || undefined,
      explicit_content: explicitContent,
      external_link: externalLinkState.value || undefined,
      royalty_info:
        royaltyPaymentAddressState.value && royaltyShareState.value
          ? {
              payment_address: royaltyPaymentAddressState.value.trim(),
              share: (Number(royaltyShareState.value) / 100).toString(),
            }
          : undefined,
    })
  }, [
    descriptionState.value,
    imageState.value,
    explicitContent,
    externalLinkState.value,
    royaltyPaymentAddressState.value,
    royaltyShareState.value,
  ])

  useEffect(() => {
    const addresses: string[] = []
    airdropAllocationArray.forEach((allocation) => {
      for (let i = 0; i < Number(allocation.amount); i++) {
        addresses.push(allocation.address)
      }
    })
    //shuffle the addresses array
    for (let i = addresses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[addresses[i], addresses[j]] = [addresses[j], addresses[i]]
    }
    setAirdropArray(addresses)
  }, [airdropAllocationArray])

  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select an action!')
      }
      if (minterContractAddress === '' && sg721ContractAddress === '') {
        throw new Error('Please enter minter and sg721 contract addresses!')
      }
      if (type === 'update_mint_price' && priceState.value < 50) {
        throw new Error('Mint price must be at least 50 STARS')
      }

      if (wallet.client && type === 'update_mint_price') {
        const contractConfig = wallet.client.queryContractSmart(minterContractAddress, {
          config: {},
        })
        await toast
          .promise(
            wallet.client.queryContractSmart(minterContractAddress, {
              mint_price: {},
            }),
            {
              error: `Querying mint price failed!`,
              loading: 'Querying current mint price...',
              success: (price) => {
                console.log('Current mint price: ', price)
                return `Current mint price is ${Number(price.public_price.amount) / 1000000} STARS`
              },
            },
          )
          .then(async (price) => {
            if (Number(price.public_price.amount) / 1000000 <= priceState.value) {
              await contractConfig
                .then((config) => {
                  console.log(config.start_time, Date.now() * 1000000)
                  if (Number(config.start_time) < Date.now() * 1000000) {
                    throw new Error(
                      `Minting has already started on ${new Date(
                        Number(config.start_time) / 1000000,
                      ).toLocaleString()}. Updated mint price cannot be higher than the current price of ${
                        Number(price.public_price.amount) / 1000000
                      } STARS`,
                    )
                  }
                })
                .catch((error) => {
                  throw new Error(String(error).substring(String(error).lastIndexOf('Error:') + 7))
                })
            }
          })
      }

      if (
        type === 'update_collection_info' &&
        (royaltyShareState.value ? !royaltyPaymentAddressState.value : royaltyPaymentAddressState.value)
      ) {
        throw new Error('Royalty payment address and share percentage are both required')
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

  const airdropFileOnChange = (data: AirdropAllocation[]) => {
    setAirdropAllocationArray(data)
    console.log('airdrop allocation array: ', data)
  }

  return (
    <form>
      <div className="grid grid-cols-2 mt-4">
        <div className="mr-2">
          <ActionsCombobox minterType={minterType} {...actionComboboxState} />
          {showRecipientField && <AddressInput {...recipientState} />}
          {showTokenUriField && <TextInput className="mt-2" {...tokenURIState} />}
          {showWhitelistField && <AddressInput {...whitelistState} />}
          {showLimitField && <NumberInput {...limitState} />}
          {showTokenIdField && <NumberInput {...tokenIdState} />}
          {showTokenIdListField && <TextInput className="mt-2" {...tokenIdListState} />}
          {showNumberOfTokensField && <NumberInput {...batchNumberState} />}
          {showPriceField && <NumberInput {...priceState} />}
          {showDescriptionField && <TextInput className="my-2" {...descriptionState} />}
          {showImageField && <TextInput className="mb-2" {...imageState} />}
          {showExternalLinkField && <TextInput className="mb-2" {...externalLinkState} />}
          {showRoyaltyRelatedFields && (
            <div className="p-2 my-4 rounded border-2 border-gray-500/50">
              <TextInput className="mb-2" {...royaltyPaymentAddressState} />
              <NumberInput className="mb-2" {...royaltyShareState} />
            </div>
          )}
          {showExplicitContentField && (
            <div className="flex flex-col space-y-2">
              <div>
                <div className="flex">
                  <span className="mt-1 text-sm first-letter:capitalize">
                    Does the collection contain explicit content?
                  </span>
                  <div className="ml-2 font-bold form-check form-check-inline">
                    <input
                      checked={explicitContent === true}
                      className="peer sr-only"
                      id="explicitRadio1"
                      name="explicitRadioOptions1"
                      onClick={() => {
                        setExplicitContent(true)
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
                      checked={explicitContent === false}
                      className="peer sr-only"
                      id="explicitRadio2"
                      name="explicitRadioOptions2"
                      onClick={() => {
                        setExplicitContent(false)
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
          )}
          {showAirdropFileField && (
            <FormGroup
              subtitle="CSV file that contains the airdrop addresses and the amount of tokens allocated for each address. Should start with the following header row: address,amount"
              title="Airdrop File"
            >
              <AirdropUpload onChange={airdropFileOnChange} />
            </FormGroup>
          )}
          <Conditional test={showDateField}>
            <FormControl className="mt-2" htmlId="start-date" title="Start Time">
              <InputDateTime minDate={new Date()} onChange={(date) => setTimestamp(date)} value={timestamp} />
            </FormControl>
          </Conditional>
        </div>
        <div className="-mt-6">
          <div className="relative mb-2">
            <Button
              className="absolute top-0 right-0"
              isLoading={isLoading}
              onClick={mutate}
              rightIcon={<FaArrowRight />}
            >
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
      </div>
    </form>
  )
}
