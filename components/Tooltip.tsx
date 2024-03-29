import clsx from 'clsx'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { cloneElement, useState } from 'react'
import { usePopper } from 'react-popper'

export interface TooltipProps extends ComponentProps<'div'> {
  label: ReactNode
  children: ReactElement
  placement?: 'top' | 'bottom' | 'left' | 'right'
  backgroundColor?: string
}

export const Tooltip = ({ label, children, ...props }: TooltipProps) => {
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState<any>(null)
  const [show, setShow] = useState(false)

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: props.placement ? props.placement : 'top',
  })

  return (
    <>
      {/* children with attached ref and mouse events */}
      {cloneElement(children, {
        ...children.props,
        ref: setReferenceElement,
        onMouseOver: () => setShow(true),
        onMouseOut: () => setShow(false),
      })}

      {/* popper element */}
      {show && (
        <div
          {...props}
          {...attributes.popper}
          className={clsx(
            'py-1 px-2 m-1 text-sm rounded shadow-md',
            props.backgroundColor ? props.backgroundColor : 'bg-slate-900',
            props.className,
          )}
          ref={setPopperElement}
          style={{ ...styles.popper, ...props.style }}
        >
          {label}
        </div>
      )}
    </>
  )
}
