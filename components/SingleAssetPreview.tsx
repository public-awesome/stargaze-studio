/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable jsx-a11y/media-has-caption */
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { getAssetType } from 'utils/getAssetType'

export interface SingleAssetPreviewProps {
  subtitle: ReactNode
  relatedAsset?: File
  updateMetadataFileIndex: (index: number) => void
  children?: ReactNode
}

export const SingleAssetPreview = (props: SingleAssetPreviewProps) => {
  const { subtitle, relatedAsset, updateMetadataFileIndex, children } = props

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

  return (
    <div className="flex p-4 pt-0 mt-11 ml-24 space-x-4 w-full">
      <div className="flex flex-col w-full">
        <label className="flex flex-col space-y-1">
          <div>
            {/* {subtitle && <span className="text-sm text-white/50">{subtitle}</span>} */}
            {relatedAsset && (
              <div className="flex flex-row items-center mt-2 mr-4 border-2 border-dashed">
                {getAssetType(relatedAsset.name) === 'audio' && audioPreview}
                {getAssetType(relatedAsset.name) === 'video' && videoPreview}
                {getAssetType(relatedAsset.name) === 'image' && (
                  <img alt="preview" src={URL.createObjectURL(relatedAsset)} />
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
