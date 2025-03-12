/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { EncodeObject } from '@cosmjs/proto-signing'
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate'
import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressList } from 'components/forms/AddressList'
import { useAddressListState } from 'components/forms/AddressList.hooks'
import { TextInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { getConfig } from 'config'
import { MsgExec } from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { MsgStoreCode } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { AccessConfig, AccessType } from 'cosmjs-types/cosmwasm/wasm/v1/types'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import pako from 'pako'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { NETWORK } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { useWallet } from 'utils/wallet'

const UploadContract: NextPage = () => {
  const wallet = useWallet()

  const [loading, setLoading] = useState(false)
  const [transactionResult, setTransactionResult] = useState<any>()
  const [wasmFile, setWasmFile] = useState<File | null>(null)
  const [wasmByteArray, setWasmByteArray] = useState<Uint8Array | null>(null)
  const [accessType, setAccessType] = useState<
    'ACCESS_TYPE_UNSPECIFIED' | 'ACCESS_TYPE_EVERYBODY' | 'ACCESS_TYPE_ANY_OF_ADDRESSES' | 'ACCESS_TYPE_NOBODY'
  >('ACCESS_TYPE_UNSPECIFIED')
  const [accessConfig, setAccessConfig] = useState<AccessConfig | undefined>(undefined)
  const [isAuthzUpload, setIsAuthzUpload] = useState(false)

  const granterAddressState = useInputState({
    id: 'address',
    name: 'Granter Address',
    title: 'Granter Address',
    subtitle: 'The address that granted the authorization for contract upload',
    defaultValue: '',
    placeholder: 'init1...',
  })

  const memoState = useInputState({
    id: 'memo',
    name: 'Memo',
    title: 'Transaction Memo',
    defaultValue: '',
    placeholder: 'My contract',
  })

  const permittedAddressListState = useAddressListState()

  const inputFile = useRef<HTMLInputElement>(null)

  interface MsgExecAllowanceEncodeObject extends EncodeObject {
    readonly typeUrl: '/cosmos.authz.v1beta1.MsgExec'
    readonly value: Partial<MsgExec>
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setWasmFile(e.target.files[0])
  }

  useEffect(() => {
    if (wasmFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          if (!e.target?.result) return toast.error('Error parsing file.')
          const byteArray = new Uint8Array(e.target.result as ArrayBuffer)
          setWasmByteArray(byteArray)
        } catch (error: any) {
          toast.error(error.message)
        }
      }
      reader.readAsArrayBuffer(wasmFile)
    }
  }, [wasmFile])

  const upload = async () => {
    try {
      if (!wallet.isWalletConnected) return toast.error('Please connect your wallet.')
      if (!wasmFile || !wasmByteArray) return toast.error('No file selected.')
      if (accessType === 'ACCESS_TYPE_UNSPECIFIED')
        return toast.error('Please select an instantiation permission type.', { style: { maxWidth: 'none' } })

      setLoading(true)

      const client = await wallet.getSigningCosmWasmClient()

      if (!isAuthzUpload) {
        const result = await client.upload(
          wallet.address as string,
          wasmByteArray,
          'auto',
          memoState.value ?? undefined,
          accessConfig,
        )
        setTransactionResult({
          transactionHash: result.transactionHash,
          codeId: result.codeId,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          originalChecksum: result.checksum,
        })
      } else {
        if (!granterAddressState.value) {
          setLoading(false)
          return toast.error('Please enter the authorization granter address.', { style: { maxWidth: 'none' } })
        }
        const compressed = pako.gzip(wasmByteArray, { level: 9 })

        const authzExecuteContractMsg: MsgExecAllowanceEncodeObject = {
          typeUrl: '/cosmos.authz.v1beta1.MsgExec',
          value: MsgExec.fromPartial({
            grantee: wallet.address as string,
            msgs: [
              {
                typeUrl: '/cosmwasm.wasm.v1.MsgStoreCode',
                value: MsgStoreCode.encode({
                  sender: granterAddressState.value,
                  wasmByteCode: compressed,
                  instantiatePermission: accessConfig,
                }).finish(),
              },
            ],
          }),
        }

        const offlineSigner = wallet.getOfflineSignerDirect()
        const rpcUrl = getConfig(NETWORK).rpcUrl
        console.log('rpcUrl', rpcUrl)
        const stargateClient = await SigningStargateClient.connectWithSigner(rpcUrl, offlineSigner, {
          gasPrice: GasPrice.fromString('0.025ugaze'),
        })

        const result = await stargateClient.signAndBroadcast(
          wallet.address || '',
          [authzExecuteContractMsg],
          'auto',
          memoState.value ?? undefined,
        )

        setTransactionResult({
          transactionHash: result.transactionHash,
          codeId: result.events.filter((event) => event.type === 'store_code')[0].attributes[1].value,
          originalChecksum: result.events.filter((event) => event.type === 'store_code')[0].attributes[0].value,
        })
      }

      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  useEffect(() => {
    try {
      if (accessType === 'ACCESS_TYPE_ANY_OF_ADDRESSES') {
        setAccessConfig(
          AccessConfig.fromPartial({
            permission: AccessType.ACCESS_TYPE_ANY_OF_ADDRESSES,
            addresses: permittedAddressListState.entries.map((entry) => entry[1].address).filter(Boolean),
          }),
        )
      } else if (accessType === 'ACCESS_TYPE_NOBODY') {
        setAccessConfig(AccessConfig.fromPartial({ permission: AccessType.ACCESS_TYPE_NOBODY }))
      } else if (accessType === 'ACCESS_TYPE_EVERYBODY') {
        setAccessConfig(AccessConfig.fromPartial({ permission: AccessType.ACCESS_TYPE_EVERYBODY }))
      } else if (accessType === 'ACCESS_TYPE_UNSPECIFIED') {
        setAccessConfig(undefined)
      }
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }, [accessType, permittedAddressListState.entries])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Upload Contract" />
      <ContractPageHeader
        description={`Here you can upload a contract on Stargaze ${NETWORK === 'mainnet' ? 'mainnet' : 'testnet'}.`}
        link=""
        title="Upload Contract"
      />
      <div className="inset-x-0 bottom-0 border-b-2 border-white/25" />

      <div className="flex flex-col w-1/2">
        <span className="text-xl font-bold text-white">Authorization Type for Contract Instantiation</span>
        <select
          className="px-4 pt-2 pb-2 mt-2 w-1/2 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
          onChange={(e) => setAccessType(e.target.value as any)}
          value={accessType}
        >
          <option disabled value="ACCESS_TYPE_UNSPECIFIED">
            Select Authorization Type
          </option>
          <option value="ACCESS_TYPE_EVERYBODY">Everybody</option>
          <option value="ACCESS_TYPE_ANY_OF_ADDRESSES">Any of Addresses</option>
          <option value="ACCESS_TYPE_NOBODY">Nobody</option>
        </select>
      </div>

      <div className="my-2 w-1/2">
        <TextInput {...memoState} />
      </div>

      <div className="flex flex-row justify-start">
        <h1 className="mt-2 font-bold text-md">Authz Upload?</h1>
        <label className="justify-start ml-6 cursor-pointer label">
          <input
            checked={isAuthzUpload}
            className={`${isAuthzUpload ? `bg-stargaze` : `bg-gray-600`} checkbox`}
            onClick={() => {
              setIsAuthzUpload(!isAuthzUpload)
            }}
            type="checkbox"
          />
        </label>
      </div>
      <Conditional test={isAuthzUpload}>
        <div className="my-2 w-3/4">
          <TextInput {...granterAddressState} />
        </div>
      </Conditional>

      <Conditional test={accessType === 'ACCESS_TYPE_ANY_OF_ADDRESSES'}>
        <div className="my-2 w-3/4">
          <AddressList
            entries={permittedAddressListState.entries}
            onAdd={permittedAddressListState.add}
            onChange={permittedAddressListState.update}
            onRemove={permittedAddressListState.remove}
            subtitle="The list of addresses permitted to instantiate the contract"
            title="Permitted Addresses"
          />
        </div>
      </Conditional>

      <Conditional test={Boolean(transactionResult)}>
        <Alert type="info">
          <b>Upload success!</b> Here is the transaction result containing the code ID, transaction hash and other data.
        </Alert>
        <JsonPreview content={transactionResult} title="Transaction Result" />
        <br />
      </Conditional>

      <div
        className={clsx(
          'flex relative justify-center items-center space-y-4 h-32',
          'rounded border-2 border-white/20 border-dashed',
        )}
      >
        <input
          accept=".wasm"
          className={clsx(
            'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
            'before:absolute before:inset-0 before:hover:bg-white/5 before:transition',
          )}
          onChange={onFileChange}
          ref={inputFile}
          type="file"
        />
      </div>

      <div className="flex justify-end pb-6">
        <Button isDisabled={!wasmFile} isLoading={loading} isWide leftIcon={<FaAsterisk />} onClick={upload}>
          Upload Contract
        </Button>
      </div>
    </section>
  )
}

export default withMetadata(UploadContract, { center: false })
