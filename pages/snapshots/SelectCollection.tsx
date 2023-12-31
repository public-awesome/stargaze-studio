/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable jsx-a11y/img-redundant-alt */

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Input from 'components/Input'
import useSearch from 'hooks/useSearch'
import { useMemo, useState } from 'react'
import { useDebounce } from 'utils/debounce'
import { truncateAddress } from 'utils/wallet'

interface ClickableCollection {
  contractAddress: string
  name: string
  media: string
  onClick: () => void
}

export default function SelectCollection({
  title,
  setCollection,
}: {
  title?: string
  setCollection: (collectionAddress: string) => void
}) {
  const [search, setSearch] = useState('')

  const debouncedQuery = useDebounce<string>(search, 200)
  const collectionsQuery = useSearch(debouncedQuery, ['collections'], 10)
  const collectionsResults = useMemo(() => {
    return collectionsQuery.data?.find((searchResult) => searchResult.indexUid === 'collections')
  }, [collectionsQuery.data])

  const clickableCollections = useMemo(() => {
    return (
      collectionsResults?.hits.map((hit) => ({
        contractAddress: hit.id,
        name: hit.name,
        media: hit.thumbnail_url || hit.image_url,
        onClick: () => {
          setCollection(hit.id)
        },
      })) ?? []
    )
  }, [collectionsResults?.hits, setCollection])

  return (
    <div className="flex overflow-auto flex-col p-6 w-full h-[580px] bg-black border-2 border-solid border-infinity-blue">
      <h2 className="mb-4 text-lg font-bold text-infinity-blue">{title ?? 'Select the NFT collection to trade'}</h2>
      <Input
        className="mb-4 w-1/2 !rounded-none"
        icon={<MagnifyingGlassIcon className="w-5 h-5 text-zinc-400" />}
        id="collection-search"
        onChange={(e: any) => setSearch(e.target.value)}
        placeholder="Search Collections..."
        value={search}
      />

      <CollectionsTable collections={clickableCollections} />
    </div>
  )
}

const CollectionsTable = ({ collections }: { collections: ClickableCollection[] }) => {
  return (
    <table className="min-w-full divide-y divide-zinc-800">
      <thead>
        <tr>
          <th className="py-3.5 pr-3 pl-4 font-bold text-left sm:pl-0 text-infinity-blue" scope="col">
            Name
          </th>
          <th className="py-3.5 px-3 font-bold text-left text-infinity-blue" scope="col">
            Address
          </th>
        </tr>
      </thead>
      <tbody className=" bg-black">
        {collections.map((collection) => (
          <tr
            key={collection.contractAddress}
            className="hover:bg-zinc-900 cursor-pointer"
            onClick={collection.onClick}
          >
            <td className="py-2 pr-3 pl-4 whitespace-nowrap sm:pl-0">
              <div className="flex items-center">
                <div className="shrink-0 w-11 h-11">
                  <img alt="Collection Image" src={collection.media} />
                </div>
                <div className="ml-4">
                  <div className="font-medium text-white">{collection.name}</div>
                  <div className="text-zinc-400">{truncateAddress(collection.contractAddress)}</div>
                </div>
              </div>
            </td>

            <td className="py-5 px-3 text-zinc-400  whitespace-nowrap">
              <div className="text-left text-white">{truncateAddress(collection.contractAddress, 8, 6)}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
