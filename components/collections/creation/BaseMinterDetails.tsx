/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { toUtf8 } from '@cosmjs/encoding'
import axios from 'axios'
import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Conditional } from 'components/Conditional'
import { useInputState } from 'components/forms/FormInput.hooks'
import { useWallet } from 'contexts/wallet'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { API_URL } from 'utils/constants'

import { useDebounce } from '../../../utils/debounce'
import { TextInput } from '../../forms/FormInput'
import type { MinterType } from '../actions/Combobox'

export type BaseMinterAcquisitionMethod = 'existing' | 'new'

export interface MinterInfo {
  name: string
  minter: string
}

interface BaseMinterDetailsProps {
  onChange: (data: BaseMinterDetailsDataProps) => void
  minterType: MinterType
}

export interface BaseMinterDetailsDataProps {
  baseMinterAcquisitionMethod: BaseMinterAcquisitionMethod
  existingBaseMinter: string | undefined
}

export const BaseMinterDetails = ({ onChange, minterType }: BaseMinterDetailsProps) => {
  const wallet = useWallet()

  const [myBaseMinterContracts, setMyBaseMinterContracts] = useState<MinterInfo[]>([])
  const [baseMinterAcquisitionMethod, setBaseMinterAcquisitionMethod] = useState<BaseMinterAcquisitionMethod>('new')

  const existingBaseMinterState = useInputState({
    id: 'existingMinter',
    name: 'existingMinter',
    title: 'Existing Base Minter Contract Address',
    subtitle: '',
    placeholder: 'stars1...',
  })

  const fetchMinterContracts = async (): Promise<MinterInfo[]> => {
    const contracts: MinterInfo[] = await axios
      .get(`${API_URL}/api/v1beta/collections/${wallet.address}`)
      .then((response) => {
        const collectionData = response.data
        const minterContracts = collectionData.map((collection: any) => {
          return { name: collection.name, minter: collection.minter }
        })
        return minterContracts
      })
      .catch(console.error)
    console.log(contracts)
    return contracts
  }

  async function getMinterContractType(minterContractAddress: string) {
    if (wallet.client && minterContractAddress.length > 0) {
      const client = wallet.client
      const data = await client.queryContractRaw(
        minterContractAddress,
        toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
      )
      const contractType: string = JSON.parse(new TextDecoder().decode(data as Uint8Array)).contract
      return contractType
    }
  }

  const filterBaseMinterContracts = async () => {
    await fetchMinterContracts()
      .then((minterContracts) =>
        minterContracts.map(async (minterContract: any) => {
          await getMinterContractType(minterContract.minter)
            .then((contractType) => {
              if (contractType?.includes('sg-base-minter')) {
                setMyBaseMinterContracts((prevState) => [...prevState, minterContract])
              }
            })
            .catch((err) => {
              console.log(err)
              console.log('Unable to retrieve contract type')
            })
        }),
      )
      .catch((err) => {
        console.log(err)
        console.log('Unable to fetch base minter contracts')
      })
  }

  const debouncedMyBaseMinterContracts = useDebounce(myBaseMinterContracts, 500)

  const renderBaseMinterContracts = useCallback(() => {
    return myBaseMinterContracts.map((baseMinterContract, index) => {
      return (
        <option key={index} className="mt-2 text-lg bg-[#1A1A1A]">
          {`${baseMinterContract.name} - ${baseMinterContract.minter}`}
        </option>
      )
    })
  }, [debouncedMyBaseMinterContracts])

  const debouncedWalletAddress = useDebounce(wallet.address, 300)

  const displayToast = async () => {
    await toast.promise(filterBaseMinterContracts(), {
      loading: 'Retrieving previous 1/1 collections...',
      success: 'Collection retrieval finalized.',
      error: 'Unable to retrieve any 1/1 collections.',
    })
  }

  useEffect(() => {
    if (debouncedWalletAddress && baseMinterAcquisitionMethod === 'existing') {
      setMyBaseMinterContracts([])
      existingBaseMinterState.onChange('')
      void displayToast()
    }
  }, [debouncedWalletAddress, baseMinterAcquisitionMethod])

  useEffect(() => {
    const data: BaseMinterDetailsDataProps = {
      baseMinterAcquisitionMethod,
      existingBaseMinter: existingBaseMinterState.value,
    }
    onChange(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingBaseMinterState.value, baseMinterAcquisitionMethod])

  return (
    <div className="mx-10 mb-4 rounded border-2 border-white/20">
      <div className="flex justify-center mb-2">
        <div className="mt-3 ml-4 font-bold form-check form-check-inline">
          <input
            checked={baseMinterAcquisitionMethod === 'new'}
            className="peer sr-only"
            id="inlineRadio5"
            name="inlineRadioOptions5"
            onClick={() => {
              setBaseMinterAcquisitionMethod('new')
            }}
            type="radio"
            value="New"
          />
          <label
            className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black peer-checked:border-b-2 hover:border-b-2  peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
            htmlFor="inlineRadio5"
          >
            Create a New 1/1 Collection
          </label>
        </div>
        <div className="mt-3 ml-2 font-bold form-check form-check-inline">
          <input
            checked={baseMinterAcquisitionMethod === 'existing'}
            className="peer sr-only"
            id="inlineRadio6"
            name="inlineRadioOptions6"
            onClick={() => {
              setBaseMinterAcquisitionMethod('existing')
            }}
            type="radio"
            value="Existing"
          />
          <label
            className="inline-block py-1 px-2 text-gray peer-checked:text-white hover:text-white peer-checked:bg-black peer-checked:border-b-2 hover:border-b-2  peer-checked:border-plumbus hover:border-plumbus cursor-pointer form-check-label"
            htmlFor="inlineRadio6"
          >
            Append a New Token to an Existing 1/1 Collection
          </label>
        </div>
      </div>

      {baseMinterAcquisitionMethod === 'existing' && (
        <div>
          <div className={clsx('my-4 mx-10')}>
            <Conditional test={myBaseMinterContracts.length !== 0}>
              <select
                className="mt-4 w-full max-w-3xl text-sm bg-white/10 select select-bordered"
                onChange={(e) => {
                  existingBaseMinterState.onChange(e.target.value.slice(e.target.value.indexOf('stars1')))
                  e.preventDefault()
                }}
              >
                <option className="mt-2 text-lg bg-[#1A1A1A]" disabled selected>
                  Select one of your existing 1/1 collections
                </option>
                {renderBaseMinterContracts()}
              </select>
            </Conditional>
            <Conditional test={myBaseMinterContracts.length === 0}>
              <div className="flex flex-col">
                <Alert className="my-2 w-[90%]" type="info">
                  No previous 1/1 collections were found. You may create a new 1/1 collection or fill in the minter
                  contract address manually.
                </Alert>
                <TextInput
                  className="w-3/5"
                  defaultValue={existingBaseMinterState.value}
                  {...existingBaseMinterState}
                  isRequired
                />
              </div>
            </Conditional>
          </div>
        </div>
      )}
    </div>
  )
}
