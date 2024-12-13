/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/prefer-optional-chain */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-misused-promises */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable tailwindcss/classnames-order */

import type { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import type { EncodeObject } from '@cosmjs/proto-signing'
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
import { SelectCollectionWithMinter } from 'components/SelectCollectionWithMinter'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { SG721_UPDATABLE_CODE_ID } from 'utils/constants'
// import Brand from 'public/brand/brand.svg'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { useWallet } from 'utils/wallet'

const UpdateCollectionAdmin: NextPage = () => {
  const wallet = useWallet()
  const [collectionAddress, setCollectionAddress] = useState<string>('')
  const [minterAddress, setMinterAddress] = useState<string>('')

  const collectionAddressState = useInputState({
    id: 'collection-address',
    name: 'collection-address',
    title: 'Collection Address',
    defaultValue: '',
  })

  const minterAddressState = useInputState({
    id: 'minter-address',
    name: 'minter-address',
    title: 'Minter Address',
    defaultValue: '',
  })

  const newAdminAddressState = useInputState({
    id: 'new-admin-address',
    name: 'new-admin-address',
    title: 'New Collection Admin Address',
    defaultValue: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    collectionAddressState.onChange(collectionAddress)
  }, [collectionAddress])

  useEffect(() => {
    minterAddressState.onChange(minterAddress)
  }, [minterAddress])

  return (
    <section className="px-4 pt-4 pb-16 mx-auto space-y-8 ml-8 w-full">
      <NextSeo title="Manage Contract Admin" />
      <ContractPageHeader
        description="Here you can update or clear the admin address of contracts."
        link={links.Documentation}
        title="Manage Contract Admin"
      />
      <LinkTabs activeIndex={0} data={manageContractAdminLinkTabs} />
      <SelectCollectionWithMinter selectCollection={setCollectionAddress} selectMinter={setMinterAddress} />
      <AddressInput className="w-3/4" {...collectionAddressState} />
      <AddressInput className="w-3/4" {...minterAddressState} />
      <AddressInput className="w-1/2" {...newAdminAddressState} />

      <Button
        className="px-4 py-2 font-bold text-white bg-stargaze rounded-md"
        isLoading={isLoading}
        onClick={async () => {
          try {
            setErrorMessage(null)
            if (!wallet.isWalletConnected) {
              toast.error('Please connect your wallet.', {
                style: { maxWidth: 'none' },
              })
              setIsLoading(false)
              return
            }
            if (
              collectionAddressState.value.length === 0 ||
              minterAddressState.value.length === 0 ||
              newAdminAddressState.value.length === 0
            ) {
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

            let msgs: EncodeObject[] = []

            const collectionContractInfoResponse = await client
              .queryContractRaw(
                collectionAddressState.value.trim(),
                toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
              )
              .catch((error) => {
                toast.error(`Failed to fetch contract info: ${error.message}`, {
                  style: { maxWidth: 'none' },
                })
                setIsLoading(false)
              })
            const collectionContractInfo = JSON.parse(
              new TextDecoder().decode(collectionContractInfoResponse as Uint8Array),
            )
            if (Number((collectionContractInfo.version as string).replaceAll('.', '')) < 340) {
              console.log('Migrate collection contract')
              let migrateMsg: EncodeObject = {
                typeUrl: '/cosmwasm.wasm.v1.MsgMigrateContract',
                value: {
                  codeId: SG721_UPDATABLE_CODE_ID.toString(),
                  contract: collectionAddressState.value.trim(),
                  msg: new TextEncoder().encode(JSON.stringify({})),
                  sender: senderAddress,
                },
              }
              msgs.push(migrateMsg)
            }

            const updateCollectionCreatorMsg = {
              update_collection_info: {
                collection_info: {
                  creator: newAdminAddressState.value.trim(),
                },
              },
            }
            const executeContractMsg: MsgExecuteContractEncodeObject = {
              typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
              value: MsgExecuteContract.fromPartial({
                sender: senderAddress,
                contract: collectionAddressState.value.trim(),
                msg: toUtf8(JSON.stringify(updateCollectionCreatorMsg)),
              }),
            }
            msgs.push(executeContractMsg)

            let collectionContractMsg: EncodeObject = {
              typeUrl: '/cosmwasm.wasm.v1.MsgUpdateAdmin',
              value: {
                contract: collectionAddressState.value.trim(),
                newAdmin: newAdminAddressState.value.trim(),
                sender: senderAddress,
              },
            }
            msgs.push(collectionContractMsg)

            let minterContractMsg: EncodeObject = {
              typeUrl: '/cosmwasm.wasm.v1.MsgUpdateAdmin',
              value: {
                contract: minterAddressState.value.trim(),
                newAdmin: newAdminAddressState.value.trim(),
                sender: senderAddress,
              },
            }
            msgs.push(minterContractMsg)

            const response = await client
              .signAndBroadcast(senderAddress, msgs, defaultFee, 'Update Collection Admin')
              .catch((error) => {
                toast.error(`Failed to update collection admin: ${error.message}`, {
                  style: { maxWidth: 'none' },
                })
                setIsLoading(false)
              })
            if (response && !response.rawLog?.includes('failed')) {
              toast.success('Collection admin successfully updated.', {
                style: { maxWidth: 'none' },
              })
              setTransactionHash(response.transactionHash)
            } else if (response && response.rawLog?.includes('failed')) {
              toast.error('Failed to update collection admin.', {
                style: { maxWidth: 'none' },
              })
              setErrorMessage(response.rawLog)
            }
            setIsLoading(false)
          } catch (error: any) {
            console.error('Failed to update admin: ', error)
            toast.error(`Failed to update admin: ${error.message}`, {
              style: { maxWidth: 'none' },
            })
            setIsLoading(false)
          }
        }}
      >
        {' '}
        Update Collection Admin
      </Button>
      <Conditional test={transactionHash !== null}>
        <Alert className="w-3/4" type="info">
          <b>Transaction Hash:</b> {transactionHash}
        </Alert>
      </Conditional>
      <Conditional test={errorMessage !== null}>
        <Alert className="w-3/4" type="info">
          <b>Error:</b> {errorMessage}
        </Alert>
      </Conditional>
    </section>
  )
}

export default withMetadata(UpdateCollectionAdmin, { center: false })
