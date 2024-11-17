/* eslint-disable eslint-comments/disable-enable-pair */

import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { NETWORK } from 'utils/constants'
import { useDebounce } from 'utils/debounce'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { useWallet } from 'utils/wallet'

const RemoveListingPage: NextPage = () => {
  const wallet = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const askIdState = useInputState({
    id: 'askId',
    name: 'askId',
    title: 'Listing ID',
    defaultValue: '',
    placeholder: 'd25244b46e...',
  })
  const askId = useDebounce(askIdState.value, 300)

  const router = useRouter()

  useEffect(() => {
    if (askId.length > 0) {
      void router.replace({ query: { askId } })
    }
    if (askId.length === 0) {
      void router.replace({ query: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askId])

  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('askId')
    if (initial && initial.length > 0) askIdState.onChange(initial)
  }, [])

  const handleRemoveListing = async () => {
    if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')
    if (!askIdState.value) return toast.error('Please enter a listing ID.')

    const client = await wallet.getSigningCosmWasmClient()
    setTxHash(undefined)
    setIsLoading(true)
    try {
      const result = await client.execute(
        wallet.address as string,
        NETWORK === 'mainnet'
          ? 'stars1e6g3yhasf7cr2vnae7qxytrys4e8v8wchyj377juvxfk9k6t695s38jkgw'
          : 'stars1amre4lldudy8pajhhmfehr83ysy89km3zlz3xyd5lk08y457zeps638l73',
        {
          remove_ask: {
            id: askIdState.value,
          },
        },
        'auto',
      )
      toast.success('Listing successfully removed.')
      setTxHash(result.transactionHash)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
      setTxHash(undefined)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Remove Listing" />
      <ContractPageHeader link={links.Documentation} title="Remove Listing" />
      <div className="space-y-8">
        <TextInput {...askIdState} />
      </div>

      <div className="flex flex-row content-center">
        <Button
          isDisabled={askIdState.value === ''}
          isLoading={isLoading}
          onClick={() => {
            void handleRemoveListing()
          }}
        >
          Remove Listing
        </Button>
      </div>
      <Conditional test={txHash !== undefined}>
        <Alert type="info">
          <b>Transaction Hash:</b> {txHash}
        </Alert>
      </Conditional>
    </section>
  )
}

export default withMetadata(RemoveListingPage, { center: false })
