/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable jsx-a11y/media-has-caption */
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { getAssetType } from 'utils/getAssetType'

export interface MetadataFormGroupProps {
  title: string
  subtitle: ReactNode
  relatedAsset?: File
  children?: ReactNode
}

export const MetadataFormGroup = (props: MetadataFormGroupProps) => {
  const { title, subtitle, relatedAsset, children } = props
  const [htmlContents, setHtmlContents] = useState<string>('')

  const videoPreview = useMemo(
    () => (
      <video
        controls
        id="video"
        onMouseEnter={(e) => e.currentTarget.play()}
        onMouseLeave={(e) => e.currentTarget.pause()}
        src={relatedAsset ? URL.createObjectURL(relatedAsset) : ''}
      />
    ),
    [relatedAsset],
  )

  const audioPreview = useMemo(
    () => (
      <audio
        controls
        id="audio"
        onMouseEnter={(e) => e.currentTarget.play()}
        onMouseLeave={(e) => e.currentTarget.pause()}
        src={relatedAsset ? URL.createObjectURL(relatedAsset) : ''}
      />
    ),
    [relatedAsset],
  )

  useEffect(() => {
    if (getAssetType(relatedAsset?.name as string) !== 'html') return
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setHtmlContents(e.target.result)
      }
    }
    reader.readAsText(new Blob([relatedAsset as File]))
  }, [relatedAsset])

  return (
    <div className="flex p-4 pt-0 space-x-4 w-full">
      <div className="flex flex-col w-1/3">
        <label className="flex flex-col space-y-1">
          <span className="font-bold">{title}</span>
          {subtitle && <span className="text-sm text-white/50">{subtitle}</span>}
          <div>
            {relatedAsset && (
              <div className="flex flex-row items-center mt-2 mr-4 border-2 border-dashed">
                {getAssetType(relatedAsset.name) === 'audio' && audioPreview}
                {getAssetType(relatedAsset.name) === 'video' && videoPreview}
                {getAssetType(relatedAsset.name) === 'image' && (
                  <img alt="preview" src={URL.createObjectURL(relatedAsset)} />
                )}
                {getAssetType(relatedAsset.name) === 'html' && (
                  <div>
                    <iframe allowFullScreen height="420px" srcDoc={htmlContents} title="Preview" width="100%" />
                  </div>
                )}
              </div>
            )}
          </div>
        </label>
      </div>
      <div className="space-y-4 w-2/3">{children}</div>
    </div>
  )
}
