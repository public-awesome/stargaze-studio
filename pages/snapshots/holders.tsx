/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable tailwindcss/classnames-order */

import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { LinkTabs } from 'components/LinkTabs'
import { snapshotLinkTabs } from 'components/LinkTabs.data'
import { SelectCollection } from 'components/SelectCollection'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
// import Brand from 'public/brand/brand.svg'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const Holders: NextPage = () => {
  const [collectionAddress, setCollectionAddress] = useState<string>('')
  const collectionAddressState = useInputState({
    id: 'collection-address',
    name: 'collection-address',
    title: 'Collection Address',
    defaultValue: '',
  })

  const [includeStaked, setIncludeStaked] = useState<boolean>(true)
  const [includeListed, setIncludeListed] = useState<boolean>(true)
  const [includeInPool, setIncludeInPool] = useState<boolean>(true)
  const [exportIndividualTokens, setExportIndividualTokens] = useState<boolean>(false)
  const [includeOsmosisHolders, setIncludeOsmosisHolders] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)

  const snapshotEndpoint = `https://metabase.stargaze-apis.com/api/public/card/4cf9550e-5eb7-4fe7-bd3b-dc33229f53dc/query/json?parameters=%5B%7B%22type%22%3A%22category%22%2C%22value%22%3A%22${collectionAddressState.value}%22%2C%22id%22%3A%22cb34b7a8-70cf-ba86-8d9c-360b5b2fedd3%22%2C%22target%22%3A%5B%22variable%22%2C%5B%22template-tag%22%2C%22collection_addr%22%5D%5D%7D%5D`
  const madScientistsEndPoint = `https://www.eleiton.dev/api/madscientists/snapshot?chain=stargaze`
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/'

  const download = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a')
    const file = new Blob([content], { type: contentType })
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
  }

  useEffect(() => {
    collectionAddressState.onChange(collectionAddress)
    setIncludeOsmosisHolders(false)
  }, [collectionAddress])

  return (
    <section className="px-4 pt-4 pb-16 mx-auto space-y-8 ml-8 w-full">
      <NextSeo title="Snapshots" />
      <ContractPageHeader
        description="Here you can export the snapshot of the holders for a collection."
        link={links.Documentation}
        title="Snapshots"
      />
      <LinkTabs activeIndex={0} data={snapshotLinkTabs} />
      <SelectCollection selectCollection={setCollectionAddress} />
      <AddressInput className="w-3/4" {...collectionAddressState} />
      <div className="flex-col mt-2 w-full form-control">
        <h1 className="underline text-lg font-bold">Snapshot Options </h1>
        <div className="flex-row w-full">
          <label className="justify-start cursor-pointer label w-2/5">
            <span className="mr-2 font-bold">Include tokens listed on Marketplace</span>
            <input
              checked={includeListed}
              className={`${includeListed ? `bg-stargaze` : `bg-gray-600`} checkbox`}
              onClick={() => {
                setIncludeListed(!includeListed)
              }}
              type="checkbox"
            />
          </label>
          <label className="justify-start cursor-pointer label w-2/5">
            <span className="mr-2 font-bold">Include tokens staked on DAOs</span>
            <input
              checked={includeStaked}
              className={`${includeStaked ? `bg-stargaze` : `bg-gray-600`} checkbox`}
              onClick={() => {
                setIncludeStaked(!includeStaked)
              }}
              type="checkbox"
            />
          </label>
          <label className="justify-start cursor-pointer label w-2/5">
            <span className="mr-2 font-bold">Include tokens in Infinity Pools</span>
            <input
              checked={includeInPool}
              className={`${includeInPool ? `bg-stargaze` : `bg-gray-600`} checkbox`}
              onClick={() => {
                setIncludeInPool(!includeInPool)
              }}
              type="checkbox"
            />
          </label>
          <label className="justify-start cursor-pointer label w-2/5">
            <span className="mr-2 font-bold">Export by Token ID</span>
            <input
              checked={exportIndividualTokens}
              className={`${exportIndividualTokens ? `bg-stargaze` : `bg-gray-600`} checkbox`}
              onClick={() => {
                setExportIndividualTokens(!exportIndividualTokens)
              }}
              type="checkbox"
            />
          </label>
          <Conditional
            test={
              collectionAddressState.value.trim() === 'stars1v8avajk64z7pppeu45ce6vv8wuxmwacdff484lqvv0vnka0cwgdqdk64sf'
            }
          >
            <label className="justify-start cursor-pointer label w-2/5">
              <span className="mr-2 font-bold">Include Mad Scientists holders on Osmosis</span>
              <input
                checked={includeOsmosisHolders}
                className={`${includeOsmosisHolders ? `bg-stargaze` : `bg-gray-600`} checkbox`}
                onClick={() => {
                  setIncludeOsmosisHolders(!includeOsmosisHolders)
                }}
                type="checkbox"
              />
            </label>
            <Conditional test={includeOsmosisHolders}>
              <Alert type="info">
                Snapshots for Osmosis are provided by Eleiton and updated once a day. Tokens transferred or acquired
                recently might not appear on the snapshot.
              </Alert>
            </Conditional>
          </Conditional>
        </div>
      </div>

      <Button
        className="px-4 py-2 font-bold text-white bg-stargaze rounded-md"
        isLoading={isLoading}
        onClick={() => {
          if (collectionAddressState.value.length === 0) {
            toast.error('Please select a collection or enter a valid collection address.', {
              style: { maxWidth: 'none' },
            })
            return
          }

          let madScientistsHolders: any[] = []
          let snapshotData: any[] = []
          setIsLoading(true)

          const fetchPromises = []
          fetchPromises.push(
            fetch(snapshotEndpoint)
              .then((response) => response.json())
              .then((data) => {
                if (data.length === 0) {
                  toast.error('Could not fetch snapshot data for the given collection address.')
                  return
                }
                snapshotData = data
              })
              .catch((err) => {
                console.error('Could not fetch snapshot data:', err)
                toast.error(`Could not fetch snapshot data: ${err}`)
              }),
          )

          if (
            includeOsmosisHolders &&
            collectionAddressState.value.trim() === 'stars1v8avajk64z7pppeu45ce6vv8wuxmwacdff484lqvv0vnka0cwgdqdk64sf'
          ) {
            fetchPromises.push(
              fetch(proxyUrl + madScientistsEndPoint)
                .then((response) => response.json())
                .then((data) => {
                  console.log('Successfully fetched Mad Scientists holders')
                  madScientistsHolders = data
                })
                .catch((err) => {
                  console.error('Could not fetch Mad Scientists holders:', err)
                  toast.error(`Could not fetch Mad Scientists holders: ${err}`)
                }),
            )
          }

          Promise.all(fetchPromises)
            .then(() => {
              if (exportIndividualTokens) {
                let csv = `address,tokenId\n${snapshotData
                  .map((row: any) => {
                    if (!includeListed && row.is_listed) return ''
                    if (!includeStaked && row.is_staked) return ''
                    if (!includeInPool && row.is_in_pool) return ''
                    if (row.owner_addr === null) return ''
                    return `${row.owner_addr},${row.token_id}\n`
                  })
                  .join('')}`

                if (includeOsmosisHolders && madScientistsHolders.length > 0) {
                  madScientistsHolders.forEach((row) => {
                    csv += `${row.owner_addr},${row.token_id}\n`
                  })
                }

                download(csv, 'snapshot.csv', 'text/csv')
                setIsLoading(false)
                return
              }

              const aggregatedData: any[] = []
              snapshotData.forEach((row: any) => {
                if (!includeListed && row.is_listed) return
                if (!includeStaked && row.is_staked) return
                if (!includeInPool && row.is_in_pool) return
                if (row.owner_addr === null) return

                const existingRow = aggregatedData.find((r) => r.address === row.owner_addr)
                if (existingRow) {
                  existingRow.amount += 1
                } else {
                  aggregatedData.push({ address: row.owner_addr, amount: 1 })
                }
              })

              if (includeOsmosisHolders && madScientistsHolders.length > 0) {
                madScientistsHolders.forEach((row) => {
                  const existingRow = aggregatedData.find((r) => r.address === row.owner_addr)
                  if (existingRow) {
                    existingRow.amount += 1
                  } else {
                    aggregatedData.push({ address: row.owner_addr, amount: 1 })
                  }
                })
              }

              aggregatedData.sort((a, b) => b.amount - a.amount)
              const csv = `address,amount\n${aggregatedData.map((row: any) => Object.values(row).join(',')).join('\n')}`
              download(csv, 'snapshot.csv', 'text/csv')
              setIsLoading(false)
            })
            .catch((err) => {
              setIsLoading(false)
              console.error('Error processing fetch requests:', err)
              toast.error(`Error processing fetch requests: ${err}`)
            })
        }}
      >
        {' '}
        Export Snapshot
      </Button>
    </section>
  )
}

export default withMetadata(Holders, { center: false })
