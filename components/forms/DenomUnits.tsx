import { FormControl } from 'components/FormControl'
import { NumberInput, TextInput } from 'components/forms/FormInput'
import { useEffect, useId, useMemo } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { useWallet } from 'utils/wallet'

import { useInputState, useNumberInputState } from './FormInput.hooks'

export interface DenomUnit {
  denom: string
  exponent: number
  aliases: string
}

export interface DenomUnitsProps {
  title: string
  subtitle?: string
  isRequired?: boolean
  attributes: [string, DenomUnit][]
  onAdd: () => void
  onChange: (key: string, attribute: DenomUnit) => void
  onRemove: (key: string) => void
}

export function DenomUnits(props: DenomUnitsProps) {
  const { title, subtitle, isRequired, attributes, onAdd, onChange, onRemove } = props

  return (
    <FormControl isRequired={isRequired} subtitle={subtitle} title={title}>
      {attributes.map(([id], i) => (
        <DenomUnit
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

export interface DenomUnitProps {
  id: string
  isLast: boolean
  onAdd: DenomUnitsProps['onAdd']
  onChange: DenomUnitsProps['onChange']
  onRemove: DenomUnitsProps['onRemove']
  defaultAttribute: DenomUnit
}

export function DenomUnit({ id, isLast, onAdd, onChange, onRemove, defaultAttribute }: DenomUnitProps) {
  const wallet = useWallet()
  const Icon = useMemo(() => (isLast ? FaPlus : FaMinus), [isLast])

  const htmlId = useId()

  const denomState = useInputState({
    id: `ma-denom-${htmlId}`,
    name: `ma-denom-${htmlId}`,
    title: `Denom`,
    defaultValue: defaultAttribute.denom,
  })

  const exponentState = useNumberInputState({
    id: `mint-exponent-${htmlId}`,
    name: `mint-exponent-${htmlId}`,
    title: `Exponent`,
    defaultValue: defaultAttribute.exponent,
  })

  const aliasesState = useInputState({
    id: `ma-aliases-${htmlId}`,
    name: `ma-aliases-${htmlId}`,
    title: `Aliases`,
    defaultValue: defaultAttribute.aliases,
    placeholder: 'Comma separated aliases',
  })

  useEffect(() => {
    onChange(id, { denom: denomState.value, exponent: exponentState.value, aliases: aliasesState.value })
  }, [id, denomState.value, exponentState.value, aliasesState.value])

  return (
    <div className="grid relative md:grid-cols-[40%_18%_35_7%] lg:grid-cols-[55%_13%_25%_7%] 2xl:grid-cols-[55%_13%_25%_7%] 2xl:space-x-2">
      <TextInput {...denomState} />
      <NumberInput className="ml-2" {...exponentState} />
      <TextInput className="ml-2" {...aliasesState} />

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
