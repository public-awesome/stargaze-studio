/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable import/no-default-export */

import type { ChangeEvent } from 'react'
import { classNames } from 'utils/css'

export interface TrailingSelectProps {
  id: string
  label: string
  options: string[]
  value: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

export default function TrailingSelect({ id, label, value, onChange, options }: TrailingSelectProps) {
  const cachedClassNames = classNames(
    'h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-zinc-500 dark:text-zinc-400 sm:text-sm',
    'focus:border-transparent focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary-500 focus:ring-0 focus:ring-offset-0',
  )

  return (
    <div className="flex absolute inset-y-0 right-0 items-center">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>

      <select className={cachedClassNames} id={id} name={id} onChange={onChange} value={value}>
        {/* TODO - Option values in a select are supposed to be unique, remove this comment during PR review */}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
