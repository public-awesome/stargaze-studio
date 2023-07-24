import { toUtf8 } from '@cosmjs/encoding'
import { FormControl } from 'components/FormControl'
import { AddressInput } from 'components/forms/FormInput'
import { useWallet } from 'contexts/wallet'
import { useEffect, useId, useMemo } from 'react'
import toast from 'react-hot-toast'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { SG721_NAME_ADDRESS } from 'utils/constants'
import { isValidAddress } from 'utils/isValidAddress'

import { useInputState } from './FormInput.hooks'

export interface Address {
  address: string
}

export interface AddressListProps {
  title: string
  subtitle?: string
  isRequired?: boolean
  entries: [string, Address][]
  onAdd: () => void
  onChange: (key: string, address: Address) => void
  onRemove: (key: string) => void
}

export function AddressList(props: AddressListProps) {
  const { title, subtitle, isRequired, entries, onAdd, onChange, onRemove } = props
  return (
    <FormControl isRequired={isRequired} subtitle={subtitle} title={title}>
      {entries.map(([id], i) => (
        <Address
          key={`ib-${id}`}
          defaultValue={entries[i][1]}
          id={id}
          isLast={i === entries.length - 1}
          onAdd={onAdd}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}
    </FormControl>
  )
}

export interface AddressProps {
  id: string
  isLast: boolean
  onAdd: AddressListProps['onAdd']
  onChange: AddressListProps['onChange']
  onRemove: AddressListProps['onRemove']
  defaultValue?: Address
}

export function Address({ id, isLast, onAdd, onChange, onRemove, defaultValue }: AddressProps) {
  const wallet = useWallet()
  const Icon = useMemo(() => (isLast ? FaPlus : FaMinus), [isLast])

  const htmlId = useId()

  const addressState = useInputState({
    id: `ib-address-${htmlId}`,
    name: `ib-address-${htmlId}`,
    title: ``,
    defaultValue: defaultValue?.address,
  })

  const resolveAddress = async (name: string) => {
    if (!wallet.client) throw new Error('Wallet not connected')
    await wallet.client
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
        if (tokenUri && isValidAddress(tokenUri)) onChange(id, { address: tokenUri })
        else {
          toast.error(`Resolved address is empty or invalid for the name: ${name}.stars`)
          onChange(id, { address: '' })
        }
      })
      .catch((err) => {
        toast.error(`Error resolving address for the name: ${name}.stars`)
        console.error(err)
        onChange(id, { address: '' })
      })
  }
  useEffect(() => {
    if (addressState.value.endsWith('.stars')) {
      void resolveAddress(addressState.value.split('.')[0])
    } else {
      onChange(id, {
        address: addressState.value,
      })
    }
  }, [addressState.value, id])

  return (
    <div className="grid relative grid-cols-[1fr_auto] space-x-2">
      <AddressInput {...addressState} />
      <div className="flex justify-end items-end pb-2 w-8">
        <button
          className="flex justify-center items-center p-2 bg-stargaze-80 hover:bg-plumbus-60 rounded-full"
          onClick={() => (isLast ? onAdd() : onRemove(id))}
          type="button"
        >
          <Icon className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
