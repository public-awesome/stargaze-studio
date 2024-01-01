/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-implicit-coercion */
/* eslint-disable import/no-default-export */
/* eslint-disable tsdoc/syntax */
import type { ReactNode } from 'react'

export interface FieldsetBaseType {
  /**
   * The input's required id, used to link the label and input, as well as the error message.
   */
  id: string
  /**
   * Error message to show input validation.
   */
  error?: string
  /**
   * Success message to show input validation.
   */
  success?: string
  /**
   * Label to describe the input.
   */
  label?: string | ReactNode
  /**
   * Hint to show optional fields or a hint to the user of what to enter in the input.
   */
  hint?: string
}

type FieldsetType = FieldsetBaseType & {
  children: ReactNode
}

/**
 * @name Fieldset
 * @description A fieldset component, used to share markup for labels, hints, and errors for Input components.
 *
 * @example
 * <Fieldset error={error} hint={hint} id={id} label={label}>
 *   <input id={id} {...props} />
 * </Fieldset>
 */
export default function Fieldset({ label, hint, id, children, error, success }: FieldsetType) {
  return (
    <div>
      {!!label && (
        <div className="flex justify-between mb-1">
          <label className="block w-full text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor={id}>
            {label}
          </label>

          {typeof hint === 'string' && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400" id={`${id}-optional`}>
              {hint}
            </span>
          )}
        </div>
      )}

      {children}

      {error && (
        <div className="mt-2">
          <p className="text-sm text-zinc-600" id={`${id}-error`}>
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="mt-2">
          <p className="text-sm text-zinc-500" id={`${id}-success`}>
            {success}
          </p>
        </div>
      )}
    </div>
  )
}
