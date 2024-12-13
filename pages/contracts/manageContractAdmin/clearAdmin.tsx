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

const ClearAdmin: NextPage = () => {
  const wallet = useWallet()
  const contractAddressState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Contract Address',
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
      <LinkTabs activeIndex={2} data={manageContractAdminLinkTabs} />
      <AddressInput className="w-1/2" {...contractAddressState} />

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
          if (contractAddressState.value.length === 0) {
            toast.error('Please fill in the contract address.', {
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
            .clearAdmin(senderAddress, contractAddressState.value.trim(), defaultFee, 'Clear Contract Admin')
            .catch((error) => {
              toast.error(`Failed to clear admin: ${error.message}`, {
                style: { maxWidth: 'none' },
              })
              setIsLoading(false)
            })
          if (response) {
            toast.success('Admin cleared successfully.', {
              style: { maxWidth: 'none' },
            })
            setTransactionHash(response.transactionHash)
          }
          setIsLoading(false)
        }}
      >
        {' '}
        Clear Admin
      </Button>
      <Conditional test={transactionHash !== null}>
        <Alert className="w-3/4" type="info">
          <b>Transaction Hash:</b> {transactionHash}
        </Alert>
      </Conditional>
    </section>
  )
}

export default withMetadata(ClearAdmin, { center: false })
