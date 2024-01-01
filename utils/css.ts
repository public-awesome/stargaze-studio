import { twMerge } from 'tailwind-merge'

export function classNames(...classes: (false | null | undefined | string)[]) {
  return twMerge(classes.filter(Boolean).join(' '))
}
