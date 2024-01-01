/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable import/no-default-export */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable jsx-a11y/autocomplete-valid */
/* eslint-disable tsdoc/syntax */
import type { PropsOf } from '@headlessui/react/dist/types'
import type { ReactNode } from 'react'
import { forwardRef } from 'react'
import { classNames } from 'utils/css'

import type { FieldsetBaseType } from './Fieldset'
import Fieldset from './Fieldset'
import type { TrailingSelectProps } from './TrailingSelect'
import TrailingSelect from './TrailingSelect'

/**
 * Shared styles for all input components.
 */
export const inputClassNames = {
  base: [
    'block w-full rounded-lg bg-white shadow-sm dark:bg-zinc-900 sm:text-sm',
    'text-white placeholder:text-zinc-500 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary-500 focus:ring-0 focus:ring-offset-0',
  ],
  valid: 'border-zinc-300 focus:border-zinc-300 dark:border-zinc-800 dark:focus:border-zinc-800',
  invalid: '!text-red-500 !border-red-500 focus:!border-red-500',
  success: 'text-green border-green focus:border-green',
}

type InputProps = Omit<PropsOf<'input'> & FieldsetBaseType, 'className'> & {
  directory?: 'true'
  mozdirectory?: 'true'
  webkitdirectory?: 'true'
  leadingAddon?: string
  trailingAddon?: string
  trailingAddonIcon?: ReactNode
  trailingSelectProps?: TrailingSelectProps
  autoCompleteOff?: boolean
  preventAutoCapitalizeFirstLetter?: boolean
  className?: string
  icon?: JSX.Element
}

/**
 * @name Input
 * @description A standard input component, defaults to the text type.
 *
 * @example
 * // Standard input
 * <Input id="first-name" name="first-name" />
 *
 * @example
 * // Input component with label, placeholder and type email
 * <Input id="email" name="email" type="email" autoComplete="email" label="Email" placeholder="name@email.com" />
 *
 * @example
 * // Input component with label and leading and trailing addons
 * <Input
 *   id="input-label-leading-trailing"
 *   label="Bid"
 *   placeholder="0.00"
 *   leadingAddon="$"
 *   trailingAddon="USD"
 * />
 *
 * @example
 * // Input component with label and trailing select
 * const [trailingSelectValue, trailingSelectValueSet] = useState('USD');
 *
 * <Input
 *   id="input-label-trailing-select"
 *   label="Bid"
 *   placeholder="0.00"
 *   trailingSelectProps={{
 *     id: 'currency',
 *     label: 'Currency',
 *     value: trailingSelectValue,
 *     onChange: (event) => trailingSelectValueSet(event.target.value),
 *     options: ['USD', 'CAD', 'EUR'],
 *   }}
 * />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      success,
      hint,
      label,
      leadingAddon,
      trailingAddon,
      trailingAddonIcon,
      trailingSelectProps,
      id,
      className,
      type = 'text',
      autoCompleteOff = false,
      preventAutoCapitalizeFirstLetter,
      icon,
      ...rest
    },
    ref,
  ) => {
    const cachedClassNames = classNames(
      ...inputClassNames.base,
      className,
      error ? inputClassNames.invalid : inputClassNames.valid,
      success ? inputClassNames.success : inputClassNames.valid,
      leadingAddon && 'pl-7',
      trailingAddon && 'pr-12',
      trailingSelectProps && 'pr-16',
      icon && 'pl-10',
    )

    const describedBy = [
      ...(error ? [`${id}-error`] : []),
      ...(success ? [`${id}-success`] : []),
      ...(typeof hint === 'string' ? [`${id}-optional`] : []),
      ...(typeof trailingAddon === 'string' ? [`${id}-addon`] : []),
    ].join(' ')

    return (
      <Fieldset error={error} hint={hint} id={id} label={label} success={success}>
        <div className="relative rounded-md shadow-sm">
          {leadingAddon && (
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <span className="text-zinc-500 dark:text-zinc-400 sm:text-sm">{leadingAddon}</span>
            </div>
          )}

          {icon && (
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <span className="pr-10 text-zinc-500 dark:text-zinc-400 sm:text-sm">{icon}</span>
            </div>
          )}

          <input
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : undefined}
            autoCapitalize={`${preventAutoCapitalizeFirstLetter ?? 'off'}`}
            autoComplete={`${autoCompleteOff ? 'off' : 'on'}`}
            className={cachedClassNames}
            id={id}
            ref={ref}
            type={type}
            {...rest}
          />

          {!trailingAddon && trailingSelectProps && <TrailingSelect {...trailingSelectProps} />}

          {trailingAddon && (
            <div className="flex absolute inset-y-0 right-0 items-center pr-3 pointer-events-none">
              <span className="text-zinc-500 dark:text-zinc-400 sm:text-sm" id={`${id}-addon`}>
                {trailingAddon}
              </span>
            </div>
          )}

          {trailingAddonIcon && (
            <div className="flex absolute inset-y-0 right-0 items-center pr-3 pointer-events-none">
              <span className="text-zinc-500 dark:text-zinc-400 sm:text-sm" id={`${id}-addonicon`}>
                {trailingAddonIcon}
              </span>
            </div>
          )}
        </div>
      </Fieldset>
    )
  },
)

Input.displayName = 'Input'

export default Input
