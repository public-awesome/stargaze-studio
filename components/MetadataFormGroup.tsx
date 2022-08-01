import type { ReactNode } from 'react'

export interface MetadataFormGroupProps {
  title: string
  subtitle: ReactNode
  relatedAsset?: File
  children?: ReactNode
}

export const MetadataFormGroup = (props: MetadataFormGroupProps) => {
  const { title, subtitle, relatedAsset, children } = props

  return (
    <div className="flex p-4 pt-0 space-x-4 w-full">
      <div className="flex flex-col w-1/3">
        <label className="flex flex-col space-y-1">
          <span className="font-bold">{title}</span>
          {subtitle && <span className="text-sm text-white/50">{subtitle}</span>}
          <div>
            {relatedAsset && (
              <div className="flex flex-row items-center mt-2 mr-4 border-2 border-dashed">
                <img alt="preview" src={URL.createObjectURL(relatedAsset)} />
              </div>
            )}
          </div>
        </label>
      </div>
      <div className="space-y-4 w-2/3">{children}</div>
    </div>
  )
}
