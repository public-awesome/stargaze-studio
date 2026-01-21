import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import { BiWallet } from 'react-icons/bi'
import { FaSpinner } from 'react-icons/fa'

export interface WalletButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean
}

export const WalletButton = forwardRef<HTMLButtonElement, WalletButtonProps>(function WalletButton(
  { className, children, isLoading, ...props },
  ref,
) {
  return (
    <button
      className={clsx(
        // Content styling
        'flex gap-x-2 items-center text-sm font-bold uppercase truncate',
        // Glass button styling
        'py-3 px-4 rounded-xl',
        'bg-white/[0.05] backdrop-blur-sm',
        'border border-plumbus/50',
        // Hover effects with glow
        'hover:bg-plumbus/20 hover:border-plumbus',
        'hover:shadow-[0_0_20px_rgba(219,38,118,0.3)]',
        'active:scale-[0.98]',
        // Transition
        'transition-all duration-300 ease-out',
        // Loading state
        { 'opacity-70 cursor-wait': isLoading },
        className,
      )}
      ref={ref}
      type="button"
      {...props}
    >
      {isLoading ? (
        <FaSpinner className="text-plumbus animate-spin" size={16} />
      ) : (
        <BiWallet className="text-plumbus transition-transform duration-300 group-hover:scale-110" size={16} />
      )}
      <span className="text-white">{isLoading ? 'Loading...' : children}</span>
    </button>
  )
})
