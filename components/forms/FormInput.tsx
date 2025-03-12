import { FormControl } from 'components/FormControl'
import { StyledInput } from 'components/forms/StyledInput'
import type { ComponentPropsWithRef } from 'react'
import { forwardRef } from 'react'

interface BaseProps {
  id: string
  name: string
  title: string
  subtitle?: string
  isRequired?: boolean
}

type SlicedInputProps = Omit<ComponentPropsWithRef<'input'>, keyof BaseProps>

export type FormInputProps = BaseProps & SlicedInputProps

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(props, ref) {
    const { id, name, title, subtitle, isRequired, className, ...rest } = props
    return (
      <FormControl className={className} htmlId={id} isRequired={isRequired} subtitle={subtitle} title={title}>
        <StyledInput id={id} name={name} ref={ref} {...rest} />
      </FormControl>
    )
  },
  //
)

export const AddressInput = forwardRef<HTMLInputElement, FormInputProps>(
  function AddressInput(props, ref) {
    return (
      <FormInput
        {...props}
        placeholder={props.placeholder || 'init1234567890abcdefghijklmnopqrstuvwxyz...'}
        ref={ref}
        type="text"
      />
    )
  },
  //
)

export const ValidatorAddressInput = forwardRef<HTMLInputElement, FormInputProps>(
  function ValidatorAddressInput(props, ref) {
    return (
      <FormInput
        {...props}
        placeholder={props.placeholder || 'starsvaloper1234567890abcdefghijklmnopqrstuvwxyz...'}
        ref={ref}
        type="text"
      />
    )
  },
  //
)

export const NumberInput = forwardRef<HTMLInputElement, FormInputProps>(
  function NumberInput(props, ref) {
    return <FormInput {...props} ref={ref} type="number" />
  },
  //
)

export const TextInput = forwardRef<HTMLInputElement, FormInputProps>(
  function TextInput(props, ref) {
    return <FormInput {...props} ref={ref} type="text" />
  },
  //
)

export const CheckBoxInput = forwardRef<HTMLInputElement, FormInputProps>(
  function CheckBoxInput(props, ref) {
    return (
      <div className="flex flex-col space-y-2">
        <label className="flex flex-col space-y-1" htmlFor="explicit">
          <span className="font-bold first-letter:capitalize">Explicit Content</span>
        </label>
        <input
          className="placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
          id="explicit"
          name="explicit"
          type="checkbox"
          value=""
        />
      </div>
    )
  },
  //
)

export const UrlInput = forwardRef<HTMLInputElement, FormInputProps>(
  function UrlInput(props, ref) {
    return <FormInput {...props} ref={ref} type="url" />
  },
  //
)

export const TraitTypeInput = forwardRef<HTMLInputElement, FormInputProps>(
  function TraitTypeInput(props, ref) {
    return <FormInput {...props} placeholder={props.placeholder || 'Trait Type'} ref={ref} type="text" />
  },
  //
)

export const TraitValueInput = forwardRef<HTMLInputElement, FormInputProps>(
  function TraitValueInput(props, ref) {
    return <FormInput {...props} placeholder={props.placeholder || 'Trait Value'} ref={ref} type="text" />
  },
  //
)
