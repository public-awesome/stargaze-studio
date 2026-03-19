import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import type { IconType } from 'react-icons/lib'

export interface WalletPanelButtonProps extends ComponentProps<'button'> {
  Icon: IconType
}

export const WalletPanelButton = forwardRef<HTMLButtonElement, WalletPanelButtonProps>(function WalletPanelButton(
  { className, children, Icon, ...rest },
  ref,
) {
  return (
    <button
      className={clsx(
        'flex items-center py-3 px-4 space-x-4',
        'text-gray-300 hover:text-white',
        'hover:bg-white/[0.05]',
        'transition-all duration-200',
        'group/btn',
        className,
      )}
      ref={ref}
      type="button"
      {...rest}
    >
      <Icon className="text-gray-400 group-hover/btn:text-plumbus transition-colors duration-200" />
      <span className="text-left">{children}</span>
    </button>
  )
})
