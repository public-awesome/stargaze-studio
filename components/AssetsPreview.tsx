import clsx from 'clsx'
import { useCallback, useMemo, useState } from 'react'
import { getAssetType } from 'utils/getAssetType'

import type { MinterType } from './collections/actions/Combobox'
import { Conditional } from './Conditional'

interface AssetsPreviewProps {
  assetFilesArray: File[]
  updateMetadataFileIndex: (index: number) => void
  minterType: MinterType
}

const ITEM_NUMBER = 12

export const AssetsPreview = ({ assetFilesArray, updateMetadataFileIndex, minterType }: AssetsPreviewProps) => {
  const [page, setPage] = useState(1)

  const totalPages = useMemo(() => Math.ceil(assetFilesArray.length / ITEM_NUMBER), [assetFilesArray])

  const videoPreviewElements = useMemo(() => {
    const tempArray: JSX.Element[] = []
    assetFilesArray.forEach((assetFile) => {
      if (getAssetType(assetFile.name) === 'video') {
        tempArray.push(
          <video
            key={assetFile.name}
            className={clsx(
              'absolute px-1 my-1 thumbnail',
              { 'max-h-24': minterType === 'vending' },
              { 'max-h-72': minterType === 'base' },
            )}
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

  const getOverlaySize = () => {
    if (assetFilesArray.length < 100) return 'w-[22px] h-[22px]'
    if (assetFilesArray.length > 100 && assetFilesArray.length <= 1000 && page < 9) return 'w-[22px] h-[22px]'
    else if (page < 84) return 'w-[27px] h-[27px]'
    return 'w-[35px] h-[35px]'
  }

  const renderImages = useCallback(() => {
    return assetFilesArray.slice((page - 1) * ITEM_NUMBER, page * ITEM_NUMBER).map((assetSource, index) => (
      <button
        key={assetSource.name}
        className={clsx(
          'relative p-0 bg-transparent hover:bg-transparent border-0 btn modal-button',
          { 'w-[100px] h-[100px]': minterType === 'vending' },
          { 'mt-14 ml-20 w-[288px] h-[288px]': minterType === 'base' },
        )}
        onClick={() => {
          updateMetadataFileIndex((page - 1) * ITEM_NUMBER + index)
        }}
        type="button"
      >
        <label
          className="relative p-0 w-full h-full bg-transparent hover:bg-transparent border-0 btn modal-button"
          htmlFor="my-modal-4"
        >
          <Conditional test={minterType === 'vending'}>
            <div
              className={clsx(
                'flex absolute right-20 bottom-20 justify-center items-center',
                'text-sm  text-white bg-stargaze rounded-full',
                getOverlaySize(),
              )}
            >
              {(page - 1) * 12 + (index + 1)}
            </div>
          </Conditional>
          {getAssetType(assetSource.name) === 'audio' && (
            <div className="flex absolute flex-col items-center mt-4 ml-2">
              <img
                key={`audio-${index}`}
                alt="audio_icon"
                className={clsx(
                  'mb-2 ml-1 thumbnail',
                  { 'w-6 h-6': minterType === 'vending' },
                  { 'w-24 h-24': minterType === 'base' },
                )}
                src="/audio.png"
              />
              <span className="flex self-center ">{assetSource.name}</span>
            </div>
          )}
          {getAssetType(assetSource.name) === 'video' &&
            videoPreviewElements.filter((videoPreviewElement) => videoPreviewElement.key === assetSource.name)}

          {getAssetType(assetSource.name) === 'image' && (
            <div>
              <img
                key={`image-${index}`}
                alt="asset"
                className={clsx(
                  'px-1 my-1 thumbnail',
                  { 'max-h-24': minterType === 'vending' },
                  { 'max-h-72': minterType === 'base' },
                )}
                src={URL.createObjectURL(assetSource)}
              />
            </div>
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

  const multiplePrevPage = () => {
    if (page - 10 <= 1) return setPage(1)
    setPage(page - 10)
  }

  const multipleNextPage = () => {
    if (page + 10 >= totalPages) return setPage(totalPages)
    setPage(page + 10)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mt-2 w-[400px] h-[300px]">{renderImages()}</div>
      <Conditional test={minterType === 'vending'}>
        <div className="mt-5 btn-group">
          <button className="text-white bg-plumbus-light btn" onClick={multiplePrevPage} type="button">
            ««
          </button>
          <button className="text-white bg-plumbus-light btn" onClick={prevPage} type="button">
            «
          </button>
          <button className="text-white btn" type="button">
            Page {page}/{totalPages}
          </button>
          <button className="text-white bg-plumbus-light btn" onClick={nextPage} type="button">
            »
          </button>
          <button className="text-white bg-plumbus-light btn" onClick={multipleNextPage} type="button">
            »»
          </button>
        </div>
      </Conditional>
    </div>
  )
}
