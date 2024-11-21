import { toUtf8 } from '@cosmjs/encoding'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useEffect, useId, useMemo } from 'react'
import toast from 'react-hot-toast'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { SG721_NAME_ADDRESS } from 'utils/constants'
import { isValidAddress } from 'utils/isValidAddress'
import { useWallet } from 'utils/wallet'

import { useInputState, useNumberInputState } from './FormInput.hooks'

export interface SelectedCollection {
  address: string
  amount: number
}

export interface SelectCollectionProps {
  title: string
  subtitle?: string
  isRequired?: boolean
  selectedCollections: [string, SelectedCollection][]
  onAdd: () => void
  onChange: (key: string, selectedCollection: SelectedCollection) => void
  onRemove: (key: string) => void
}

export function SelectCollection(props: SelectCollectionProps) {
  const { title, subtitle, isRequired, selectedCollections, onAdd, onChange, onRemove } = props

  return (
    <FormControl isRequired={isRequired} subtitle={subtitle} title={title}>
      {selectedCollections.map(([id], i) => (
        <SelectCollectionItem
          key={`sc-${id}`}
          defaultSelectedCollection={selectedCollections[i][1]}
          id={id}
          isLast={i === selectedCollections.length - 1}
          onAdd={onAdd}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}
    </FormControl>
  )
}

export interface SelectCollectionItemProps {
  id: string
  isLast: boolean
  onAdd: SelectCollectionProps['onAdd']
  onChange: SelectCollectionProps['onChange']
  onRemove: SelectCollectionProps['onRemove']
  defaultSelectedCollection: SelectedCollection
}

export function SelectCollectionItem({
  id,
  isLast,
  onAdd,
  onChange,
  onRemove,
  defaultSelectedCollection,
}: SelectCollectionItemProps) {
  const wallet = useWallet()
  const Icon = useMemo(() => (isLast ? FaPlus : FaMinus), [isLast])

  const htmlId = useId()

  const addressState = useInputState({
    id: `ma-address-${htmlId}`,
    name: `ma-address-${htmlId}`,
    title: `Collection Address`,
    defaultValue: defaultSelectedCollection.address,
  })

  const amountState = useNumberInputState({
    id: `amount-${htmlId}`,
    name: `amount-${htmlId}`,
    title: `Amount`,
    defaultValue: defaultSelectedCollection.amount,
  })

  useEffect(() => {
    onChange(id, { address: addressState.value, amount: amountState.value })
  }, [addressState.value, amountState.value, id])

  const resolveAddress = async (name: string) => {
    if (!wallet.isWalletConnected) throw new Error('Wallet not connected')
    await (
      await wallet.getCosmWasmClient()
    )
      .queryContractRaw(
        SG721_NAME_ADDRESS,
        toUtf8(
          Buffer.from(
            `0006${Buffer.from('tokens').toString('hex')}${Buffer.from(name).toString('hex')}`,
            'hex',
          ).toString(),
        ),
      )
      .then((res) => {
        const tokenUri = JSON.parse(new TextDecoder().decode(res as Uint8Array)).token_uri
        if (tokenUri && isValidAddress(tokenUri)) onChange(id, { address: tokenUri, amount: amountState.value })
        else {
          toast.error(`Resolved address is empty or invalid for the name: ${name}.stars`)
          onChange(id, { address: '', amount: amountState.value })
        }
      })
      .catch((err) => {
        toast.error(`Error resolving address for the name: ${name}.stars`)
        console.error(err)
        onChange(id, { address: '', amount: amountState.value })
      })
  }
  useEffect(() => {
    if (addressState.value.endsWith('.stars')) {
      void resolveAddress(addressState.value.split('.')[0])
    } else {
      onChange(id, {
        address: addressState.value,
        amount: amountState.value,
      })
    }
  }, [addressState.value, id])

  return (
    <div className="grid relative space-x-2 md:grid-cols-[40%_30%_7%] lg:grid-cols-[65%_24%_7%] 2xl:grid-cols-[70%_20%_7%]">
      <AddressInput {...addressState} />
      <NumberInput className="ml-2" {...amountState} />

      <div className="flex py-2 mt-8 w-8 h-12">
        <button
          className="flex justify-center items-center p-3 mb-1 bg-stargaze-80 hover:bg-plumbus-60 rounded-full"
          onClick={(e) => {
            e.preventDefault()
            isLast ? onAdd() : onRemove(id)
          }}
          type="button"
        >
          <Icon className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
