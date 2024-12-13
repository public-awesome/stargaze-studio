import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Input from 'components/Input'
import useSearch from 'hooks/useSearch'
import { useMemo, useState } from 'react'
import { useDebounce } from 'utils/debounce'

import { CollectionsTable } from './CollectionsTable'

export function SelectCollectionWithMinter({
  selectCollection,
  selectMinter,
}: {
  selectCollection: (collectionAddress: string) => void
  selectMinter: (minterAddress: string) => void
}) {
  const [search, setSearch] = useState('')
  const [isInputFocused, setInputFocus] = useState(false)

  const debouncedQuery = useDebounce<string>(search, 200)
  const debouncedIsInputFocused = useDebounce<boolean>(isInputFocused, 200)
  const collectionsQuery = useSearch(debouncedQuery, ['collections'], 5)
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
          selectCollection(hit.id)
          selectMinter(hit.minter)
          setSearch(hit.name)
        },
      })) ?? []
    )
  }, [collectionsResults, selectCollection, setSearch])

  const handleInputFocus = () => {
    setInputFocus(true)
  }

  const handleInputBlur = () => {
    setInputFocus(false)
  }

  return (
    <div className="flex flex-col p-4 space-y-4 w-3/4 h-full bg-black rounded-md border-2 border-gray-600 border-solid md:p-6">
      <p className="text-base font-bold text-white text-start">Select the NFT collection to update the admin for</p>
      <Input
        className="py-2 w-full text-black dark:text-white rounded-sm md:w-72"
        icon={<MagnifyingGlassIcon className="w-5 h-5 text-zinc-400" />}
        id="collection-search"
        onBlur={handleInputBlur}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={handleInputFocus}
        placeholder="Search Collections..."
        value={search}
      />

      {debouncedIsInputFocused && (
        <div className="overflow-auto w-full">
          <CollectionsTable collections={clickableCollections} />
        </div>
      )}
    </div>
  )
}
