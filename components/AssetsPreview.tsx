import { useCallback, useMemo, useState } from 'react'
import { getAssetType } from 'utils/getAssetType'

interface AssetsPreviewProps {
  assetFilesArray: File[]
  updateMetadataFileIndex: (index: number) => void
}

const ITEM_NUMBER = 12

export const AssetsPreview = ({ assetFilesArray, updateMetadataFileIndex }: AssetsPreviewProps) => {
  const [page, setPage] = useState(1)

  const totalPages = useMemo(() => Math.ceil(assetFilesArray.length / ITEM_NUMBER), [assetFilesArray])

  const videoPreviewElements = useMemo(() => {
    const tempArray: JSX.Element[] = []
    assetFilesArray.forEach((assetFile) => {
      if (getAssetType(assetFile.name) === 'video') {
        tempArray.push(
          <video
            key={assetFile.name}
            className="absolute px-1 my-1 thumbnail"
            id="video"
            muted
            onMouseEnter={(e) => {
              void e.currentTarget.play()
            }}
            onMouseLeave={(e) => {
              e.currentTarget.pause()
              e.currentTarget.currentTime = 0
            }}
            src={URL.createObjectURL(assetFile)}
          />,
        )
      }
    })
    return tempArray
  }, [assetFilesArray])

  const renderImages = useCallback(() => {
    return assetFilesArray.slice((page - 1) * ITEM_NUMBER, page * ITEM_NUMBER).map((assetSource, index) => (
      <button
        key={assetSource.name}
        className="relative p-0 w-[100px] h-[100px] bg-transparent hover:bg-transparent border-0 btn modal-button"
        onClick={() => {
          updateMetadataFileIndex((page - 1) * ITEM_NUMBER + index)
        }}
        type="button"
      >
        <label
          className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
          htmlFor="my-modal-4"
        >
          {getAssetType(assetSource.name) === 'audio' && (
            <div className="flex absolute flex-col items-center mt-4 ml-2">
              <img key={`audio-${index}`} alt="audio_icon" className="mb-2 ml-1 w-6 h-6 thumbnail" src="/audio.png" />
              <span className="flex self-center ">{assetSource.name}</span>
            </div>
          )}
          {getAssetType(assetSource.name) === 'video' &&
            videoPreviewElements.filter((videoPreviewElement) => videoPreviewElement.key === assetSource.name)}

          {getAssetType(assetSource.name) === 'image' && (
            <img
              key={`image-${index}`}
              alt="asset"
              className="px-1 my-1 thumbnail"
              src={URL.createObjectURL(assetSource)}
            />
          )}
        </label>
      </button>
    ))
  }, [page])

  const nextPage = () => {
    if (totalPages === page) return
    setPage(page + 1)
  }

  const prevPage = () => {
    if (page === 1) return
    setPage(page - 1)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mt-2 w-[400px] h-[300px]">{renderImages()}</div>
      <div className="mt-5 btn-group">
        <button className="text-white bg-plumbus-light btn" onClick={prevPage} type="button">
          «
        </button>
        <button className="text-white btn" type="button">
          Page {page}/{totalPages}
        </button>
        <button className="text-white bg-plumbus-light btn" onClick={nextPage} type="button">
          »
        </button>
      </div>
    </div>
  )
}
