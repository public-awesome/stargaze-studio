import React from 'react'

export interface ListerProps {
  data: string
  key: string
}

function Lister({ data, key }: ListerProps) {
  return (
    <span>
      {key}-{data}
    </span>
  )
}

// eslint-disable-next-line import/no-default-export
export default Lister
