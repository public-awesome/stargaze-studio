import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import type { ComponentProps, ReactNode } from 'react'
import { FaArrowRight } from 'react-icons/fa'

export interface HomeCardProps extends ComponentProps<'div'> {
  title: string
  link?: string
  linkText?: string
  children?: ReactNode
}

export const HomeCard = (props: HomeCardProps) => {
  const { title, link, linkText, children, className, ...rest } = props
  return (
    <div className={clsx('flex relative flex-col space-y-3 sm:space-y-4', className)} {...rest}>
      {/* Animated hover glow overlay */}
      <div
        className={clsx(
          'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100',
          'bg-gradient-to-br from-plumbus/10 via-transparent to-transparent',
          'transition-opacity duration-300 pointer-events-none',
        )}
      />

      <h2
        className={clsx(
          'relative font-heading text-lg font-bold sm:text-xl',
          'text-white group-hover:text-plumbus-light',
          'transition-colors duration-300',
        )}
      >
        {title}
      </h2>

      <p className="relative flex-grow text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 sm:text-base">
        {children}
      </p>

      {link && (
        <Anchor
          className={clsx(
            'flex relative before:absolute before:inset-0 items-center space-x-2',
            'font-bold text-plumbus',
            'hover:text-plumbus-light',
            'transition-all duration-300',
            'group/link',
          )}
          href={link}
        >
          <span className="group-hover/link:underline">{linkText ?? 'Open Link'}</span>
          <FaArrowRight
            className={clsx(
              'transition-all duration-300',
              'group-hover/link:translate-x-1',
              'group-hover/link:drop-shadow-[0_0_6px_rgba(219,38,118,0.6)]',
            )}
            size={12}
          />
        </Anchor>
      )}
    </div>
  )
}
