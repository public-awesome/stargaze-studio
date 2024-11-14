/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-nested-ternary */
import { coins } from '@cosmjs/proto-signing'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/vendingMinter/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/vendingMinter/ExecuteCombobox.hooks'
import CustomTokenSelect from 'components/CustomTokenSelect'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { InputDateTime } from 'components/InputDateTime'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { vendingMinterLinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { vendingMinterList } from 'config/minter'
import type { TokenInfo } from 'config/token'
import { ibcAtom } from 'config/token'
import { useContracts } from 'contexts/contracts'
import { useGlobalSettings } from 'contexts/globalSettings'
import type { DispatchExecuteArgs } from 'contracts/vendingMinter/messages/execute'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'contracts/vendingMinter/messages/execute'
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
import { resolveAddress } from 'utils/resolveAddress'
import { useWallet } from 'utils/wallet'

const VendingMinterExecutePage: NextPage = () => {
  const { vendingMinter: contract } = useContracts()
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')
  const { timezone } = useGlobalSettings()

  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined)
  const [resolvedRecipientAddress, setResolvedRecipientAddress] = useState<string>('')

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

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

  const priceState = useNumberInputState({
    id: 'price',
    name: 'price',
    title: type === 'update_discount_price' ? 'Discount Price' : 'Price',
    subtitle: type === 'update_discount_price' ? 'New discount price in STARS' : 'Enter the token price',
  })

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Vending Minter Address',
    subtitle: 'Address of the Vending Minter contract',
  })
  const contractAddress = contractState.value

  const recipientState = useInputState({
    id: 'recipient-address',
    name: 'recipient',
    title: 'Recipient Address',
    subtitle: 'Address of the recipient',
  })

  const whitelistState = useInputState({
    id: 'whitelist-address',
    name: 'whitelistAddress',
    title: 'Whitelist Address',
    subtitle: 'Address of the whitelist contract',
  })

  const mintPriceState = useNumberInputState({
    id: 'mint-price',
    name: 'mint-price',
    title: 'Mint Price',
    placeholder: '25',
  })

  const [selectedMintToken, setSelectedMintToken] = useState<TokenInfo | undefined>(ibcAtom)

  const showWhitelistField = type === 'set_whitelist'
  const showDateField = isEitherType(type, ['update_start_time', 'update_start_trading_time'])
  const showLimitField = type === 'update_per_address_limit'
  const showTokenIdField = type === 'mint_for'
  const showRecipientField = isEitherType(type, ['mint_to', 'mint_for'])
  const showPriceField = isEitherType(type, ['update_mint_price', 'update_discount_price'])
  const showMintPriceField = isEitherType(type, ['mint'])

  const messages = useMemo(() => contract?.use(contractState.value), [contract, wallet.address, contractState.value])
  const payload: DispatchExecuteArgs = {
    whitelist: whitelistState.value,
    startTime: timestamp ? (timestamp.getTime() * 1_000_000).toString() : '',
    limit: limitState.value,
    contract: contractState.value,
    tokenId: tokenIdState.value,
    messages,
    recipient: resolvedRecipientAddress,
    txSigner: wallet.address || '',
    price: priceState.value ? priceState.value.toString() : '0',
    type,
    funds:
      mintPriceState.value && mintPriceState.value > 0
        ? coins((Number(mintPriceState.value) * 1_000_000).toString(), selectedMintToken?.denom || 'ustars')
        : [],
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
      if (contractState.value === '') {
        throw new Error('Please enter the contract address.')
      }

      if (type === 'update_mint_price') {
        const client = await wallet.getCosmWasmClient()
        const contractConfig = client.queryContractSmart(contractState.value, {
          config: {},
        })
        await toast
          .promise(
            client.queryContractSmart(contractState.value, {
              mint_price: {},
            }),
            {
              error: `Querying mint price failed!`,
              loading: 'Querying current mint price...',
              success: (price) => {
                console.log(price)
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
            } else {
              await contractConfig.then(async (config) => {
                const factoryParameters = await client.queryContractSmart(config.factory, {
                  params: {},
                })
                if (
                  factoryParameters.params.min_mint_price.amount &&
                  priceState.value < Number(factoryParameters.params.min_mint_price.amount) / 1000000
                ) {
                  throw new Error(
                    `Updated mint price cannot be lower than the minimum mint price of ${
                      Number(factoryParameters.params.min_mint_price.amount) / 1000000
                    } STARS`,
                  )
                }
              })
            }
          })
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

  const resolveRecipientAddress = async () => {
    await resolveAddress(recipientState.value.trim(), wallet).then((resolvedAddress) => {
      setResolvedRecipientAddress(resolvedAddress)
    })
  }
  useEffect(() => {
    void resolveRecipientAddress()
  }, [recipientState.value])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute Vending Minter Contract" />
      <ContractPageHeader
        description="Vending Minter contract facilitates primary market vending machine style minting."
        link={links.Documentation}
        title="Vending Minter Contract"
      />
      <LinkTabs activeIndex={2} data={vendingMinterLinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          {showRecipientField && <AddressInput {...recipientState} />}
          {showWhitelistField && <AddressInput {...whitelistState} />}
          {showLimitField && <NumberInput {...limitState} />}
          {showTokenIdField && <NumberInput {...tokenIdState} />}
          {showPriceField && <NumberInput {...priceState} />}
          <Conditional test={showMintPriceField}>
            <div className="flex flex-row items-end pr-2 w-full">
              <NumberInput isRequired {...mintPriceState} />
              <CustomTokenSelect
                onOptionChange={setSelectedMintToken}
                options={vendingMinterList
                  .filter((minter) => minter.factoryAddress !== undefined && minter.updatable === false)
                  .map((minter) => minter.supportedToken)
                  .reduce((uniqueTokens: TokenInfo[], token: TokenInfo) => {
                    if (!uniqueTokens.includes(token)) {
                      uniqueTokens.push(token)
                    }
                    return uniqueTokens
                  }, [])}
                selectedOption={selectedMintToken}
              />
            </div>
          </Conditional>
          {/* TODO: Fix address execute message */}
          <Conditional test={showDateField}>
            <FormControl
              htmlId="timestamp"
              isRequired
              subtitle={`${type === 'update_start_time' ? 'Minting' : 'Trading'} start time ${
                timezone === 'Local' ? '(local)' : '(UTC)'
              }`}
              title="Start Time"
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

export default withMetadata(VendingMinterExecutePage, { center: false })
