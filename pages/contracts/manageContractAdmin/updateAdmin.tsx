/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-misused-promises */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable tailwindcss/classnames-order */

import { coins } from '@cosmjs/proto-signing'
import type { StdFee } from '@cosmjs/stargate'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { LinkTabs } from 'components/LinkTabs'
import { manageContractAdminLinkTabs } from 'components/LinkTabs.data'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import toast from 'react-hot-toast'
// import Brand from 'public/brand/brand.svg'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { useWallet } from 'utils/wallet'

const UpdateAdmin: NextPage = () => {
  const wallet = useWallet()
  const contractAddressState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Contract Address',
    defaultValue: '',
  })

  const newAdminAddressState = useInputState({
    id: 'new-admin-address',
    name: 'new-admin-address',
    title: 'New Contract Admin Address',
    defaultValue: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  return (
    <section className="px-4 pt-4 pb-16 mx-auto space-y-8 ml-8 w-full">
      <NextSeo title="Manage Contract Admin" />
      <ContractPageHeader
        description="Here you can update or clear the admin address of a contract."
        link={links.Documentation}
        title="Manage Contract Admin"
      />
      <LinkTabs activeIndex={1} data={manageContractAdminLinkTabs} />
      <AddressInput className="w-1/2" {...contractAddressState} />
      <AddressInput className="w-1/2" {...newAdminAddressState} />

      <Button
        className="px-4 py-2 font-bold text-white bg-stargaze rounded-md"
        isLoading={isLoading}
        onClick={async () => {
          if (!wallet.isWalletConnected) {
            toast.error('Please connect your wallet.', {
              style: { maxWidth: 'none' },
            })
            setIsLoading(false)
            return
          }
          if (contractAddressState.value.length === 0 || newAdminAddressState.value.length === 0) {
            toast.error('Please fill in all necessary fields.', {
              style: { maxWidth: 'none' },
            })
            return
          }
          setIsLoading(true)
          const defaultFee: StdFee = {
            amount: coins(50000000, 'ustars'),
            gas: '5000000',
          }
          const senderAddress = (await wallet.getAccount()).address
          const client = await wallet.getSigningCosmWasmClient()
          const response = await client
            .updateAdmin(
              senderAddress,
              contractAddressState.value.trim(),
              newAdminAddressState.value.trim(),
              defaultFee,
              'Update Contract Admin',
            )
            .catch((error) => {
              toast.error(`Failed to update admin: ${error.message}`, {
                style: { maxWidth: 'none' },
              })
              setIsLoading(false)
            })
          if (response) {
            toast.success('Contract admin successfully updated.', {
              style: { maxWidth: 'none' },
            })
            setTransactionHash(response.transactionHash)
          }
          setIsLoading(false)
        }}
      >
        {' '}
        Update Admin
      </Button>
      <Conditional test={transactionHash !== null}>
        <Alert className="w-3/4" type="info">
          <b>Transaction Hash:</b> {transactionHash}
        </Alert>
      </Conditional>
    </section>
  )
}

export default withMetadata(UpdateAdmin, { center: false })
