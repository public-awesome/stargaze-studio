import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useEffect, useId, useMemo } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'

import { useInputState, useNumberInputState } from './FormInput.hooks'

export interface Attribute {
  address: string
  weight: number
}

export interface MemberAttributesProps {
  title: string
  subtitle?: string
  isRequired?: boolean
  attributes: [string, Attribute][]
  onAdd: () => void
  onChange: (key: string, attribute: Attribute) => void
  onRemove: (key: string) => void
}

export function MemberAttributes(props: MemberAttributesProps) {
  const { title, subtitle, isRequired, attributes, onAdd, onChange, onRemove } = props

  return (
    <FormControl isRequired={isRequired} subtitle={subtitle} title={title}>
      {attributes.map(([id], i) => (
        <MemberAttribute
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
  onAdd: MemberAttributesProps['onAdd']
  onChange: MemberAttributesProps['onChange']
  onRemove: MemberAttributesProps['onRemove']
  defaultAttribute: Attribute
}

export function MemberAttribute({ id, isLast, onAdd, onChange, onRemove, defaultAttribute }: MemberAttributeProps) {
  const Icon = useMemo(() => (isLast ? FaPlus : FaMinus), [isLast])

  const htmlId = useId()

  const addressState = useInputState({
    id: `ma-address-${htmlId}`,
    name: `ma-address-${htmlId}`,
    title: `Address`,
    defaultValue: defaultAttribute.address,
  })

  const weightState = useNumberInputState({
    id: `ma-weight-${htmlId}`,
    name: `ma-weight-${htmlId}`,
    title: `Weight`,
    defaultValue: defaultAttribute.weight,
  })

  useEffect(() => {
    onChange(id, { address: addressState.value, weight: weightState.value })
  }, [addressState.value, weightState.value, id])

  return (
    <div className="grid relative lg:grid-cols-[70%_20%_10%] 2xl:space-x-2">
      <AddressInput {...addressState} />
      <NumberInput {...weightState} />

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
