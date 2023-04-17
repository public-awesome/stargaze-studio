import { toUtf8 } from '@cosmjs/encoding'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import type { WhitelistFlexMember } from 'components/WhitelistFlexUpload'
import { useWallet } from 'contexts/wallet'
import { useEffect, useId, useMemo } from 'react'
import toast from 'react-hot-toast'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { SG721_NAME_ADDRESS } from 'utils/constants'
import { isValidAddress } from 'utils/isValidAddress'

import { useInputState, useNumberInputState } from './FormInput.hooks'

export interface FlexMemberAttributesProps {
  title: string
  subtitle?: string
  isRequired?: boolean
  attributes: [string, WhitelistFlexMember][]
  onAdd: () => void
  onChange: (key: string, attribute: WhitelistFlexMember) => void
  onRemove: (key: string) => void
}

export function FlexMemberAttributes(props: FlexMemberAttributesProps) {
  const { title, subtitle, isRequired, attributes, onAdd, onChange, onRemove } = props

  return (
    <FormControl isRequired={isRequired} subtitle={subtitle} title={title}>
      {attributes.map(([id], i) => (
        <FlexMemberAttribute
          key={`ma-${id}`}
          defaultAttribute={attributes[i][1]}
          id={id}
          isLast={i === attributes.length - 1}
          onAdd={onAdd}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}
    </FormControl>
  )
}

export interface MemberAttributeProps {
  id: string
  isLast: boolean
  onAdd: FlexMemberAttributesProps['onAdd']
  onChange: FlexMemberAttributesProps['onChange']
  onRemove: FlexMemberAttributesProps['onRemove']
  defaultAttribute: WhitelistFlexMember
}

export function FlexMemberAttribute({ id, isLast, onAdd, onChange, onRemove, defaultAttribute }: MemberAttributeProps) {
  const wallet = useWallet()
  const Icon = useMemo(() => (isLast ? FaPlus : FaMinus), [isLast])

  const htmlId = useId()

  const addressState = useInputState({
    id: `ma-address-${htmlId}`,
    name: `ma-address-${htmlId}`,
    title: `Address`,
    defaultValue: defaultAttribute.address,
  })

  const mintCountState = useNumberInputState({
    id: `mint-count-${htmlId}`,
    name: `mint-count-${htmlId}`,
    title: `Mint Count`,
    defaultValue: defaultAttribute.mint_count,
  })

  useEffect(() => {
    onChange(id, { address: addressState.value, mint_count: mintCountState.value })
  }, [addressState.value, mintCountState.value, id])

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
        if (tokenUri && isValidAddress(tokenUri)) onChange(id, { address: tokenUri, mint_count: mintCountState.value })
        else {
          toast.error(`Resolved address is empty or invalid for the name: ${name}.stars`)
          onChange(id, { address: '', mint_count: mintCountState.value })
        }
      })
      .catch((err) => {
        toast.error(`Error resolving address for the name: ${name}.stars`)
        console.error(err)
        onChange(id, { address: '', mint_count: mintCountState.value })
      })
  }
  useEffect(() => {
    if (addressState.value.endsWith('.stars')) {
      void resolveAddress(addressState.value.split('.')[0])
    } else {
      onChange(id, {
        address: addressState.value,
        mint_count: mintCountState.value,
      })
    }
  }, [addressState.value, id])

  return (
    <div className="grid relative md:grid-cols-[50%_43%_7%] lg:grid-cols-[65%_28%_7%] 2xl:grid-cols-[70%_23%_7%] 2xl:space-x-2">
      <AddressInput {...addressState} />
      <NumberInput className="ml-2" {...mintCountState} />

      <div className="flex justify-end items-end pb-2 w-8">
        <button
          className="flex justify-center items-center p-2 bg-stargaze-80 hover:bg-plumbus-60 rounded-full"
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
