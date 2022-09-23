import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { CgSpinnerAlt } from 'react-icons/cg'

export type ButtonVariant = 'solid' | 'outline'

export interface ButtonProps extends ComponentProps<'button'> {
  isDisabled?: boolean
  isLoading?: boolean
  isWide?: boolean
  leftIcon?: JSX.Element
  rightIcon?: JSX.Element
  variant?: ButtonVariant
}

export const Button = (props: ButtonProps) => {
  const { isDisabled, isLoading, isWide, leftIcon, rightIcon, variant = 'solid', className, children, ...rest } = props

  return (
    <button
      className={clsx(
        'group flex items-center py-2 space-x-2 font-bold focus:ring',
        isWide ? 'px-8' : 'px-4',
        {
          'bg-plumbus hover:bg-plumbus-light rounded ': variant === 'solid',
          'bg-plumbus hover:bg-plumbus-light rounded border border-plumbus-dark': variant === 'outline',
          'opacity-50 cursor-not-allowed pointer-events-none': isDisabled,
          'pl-2 animate-pulse cursor-wait pointer-events-none': isLoading,
        },
        className,
      )}
      disabled={isDisabled}
      type="button"
      {...rest}
    >
      {isLoading ? <CgSpinnerAlt className="animate-spin" /> : leftIcon}
      <div>{children}</div>
      {!isLoading && rightIcon}
    </button>
  )
}
