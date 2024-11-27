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

const RemoveBidPage: NextPage = () => {
  const wallet = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const offerIdState = useInputState({
    id: 'offerId',
    name: 'offerId',
    title: 'Offer ID',
    defaultValue: '',
    placeholder: 'd25244b46e...',
  })
  const offerId = useDebounce(offerIdState.value, 300)

  const router = useRouter()

  useEffect(() => {
    if (offerId.length > 0) {
      void router.replace({ query: { offerId } })
    }
    if (offerId.length === 0) {
      void router.replace({ query: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId])

  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('offerId')
    if (initial && initial.length > 0) offerIdState.onChange(initial)
  }, [])

  const handleRemoveOffer = async () => {
    if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')
    if (!offerIdState.value) return toast.error('Please enter an offer ID.')

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
          remove_bid: {
            id: offerIdState.value,
          },
        },
        'auto',
      )
      toast.success('Offer successfully removed.')
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
      <NextSeo title="Remove Token Offer" />
      <ContractPageHeader link={links.Documentation} title="Remove Token Offer" />
      <div className="space-y-8">
        <TextInput {...offerIdState} />
      </div>

      <div className="flex flex-row content-center">
        <Button
          isDisabled={offerIdState.value === ''}
          isLoading={isLoading}
          onClick={() => {
            void handleRemoveOffer()
          }}
        >
          Remove Token Offer
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

export default withMetadata(RemoveBidPage, { center: false })
