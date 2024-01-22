/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable react/button-has-type */

import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { SelectCollection } from 'components/SelectCollection'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
// import Brand from 'public/brand/brand.svg'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const Snapshots: NextPage = () => {
  const [collectionAddress, setCollectionAddress] = useState<string>('')
  const collectionAddressState = useInputState({
    id: 'collection-address',
    name: 'collection-address',
    title: 'Collection Address',
    defaultValue: '',
  })

  const [includeStaked, setIncludeStaked] = useState<boolean>(true)
  const [includeListed, setIncludeListed] = useState<boolean>(true)
  const [exportIndividualTokens, setExportIndividualTokens] = useState<boolean>(false)

  const snapshotEndpoint = `https://metabase.constellations.zone/api/public/card/4cf9550e-5eb7-4fe7-bd3b-dc33229f53dc/query/json?parameters=%5B%7B%22type%22%3A%22category%22%2C%22value%22%3A%22${collectionAddressState.value}%22%2C%22id%22%3A%22cb34b7a8-70cf-ba86-8d9c-360b5b2fedd3%22%2C%22target%22%3A%5B%22variable%22%2C%5B%22template-tag%22%2C%22collection_addr%22%5D%5D%7D%5D`

  const download = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a')
    const file = new Blob([content], { type: contentType })
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
  }

  useEffect(() => {
    collectionAddressState.onChange(collectionAddress)
  }, [collectionAddress])

  return (
    <section className="px-4 pt-4 pb-16 mx-auto space-y-8 ml-8 w-full">
      <NextSeo title="Snapshots" />
      <ContractPageHeader
        description="Here you can export the snapshot of the holders for a collection."
        link={links.Documentation}
        title="Snapshots"
      />

      <SelectCollection selectCollection={setCollectionAddress} />
      <AddressInput className="w-3/4" {...collectionAddressState} />
      <div className="flex-col mt-2 w-full form-control">
        <h1 className="underline text-lg font-bold">Snapshot Options </h1>
        <div className="flex-row w-full">
          <label className="justify-start cursor-pointer label w-2/5">
            <span className="mr-2 font-bold">Include listed tokens on Marketplace</span>
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
            <span className="mr-2 font-bold">Include staked tokens on DAOs</span>
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
            <span className="mr-2 font-bold">Export holders for each token individually</span>
            <input
              checked={exportIndividualTokens}
              className={`${exportIndividualTokens ? `bg-stargaze` : `bg-gray-600`} checkbox`}
              onClick={() => {
                setExportIndividualTokens(!exportIndividualTokens)
              }}
              type="checkbox"
            />
          </label>
        </div>
      </div>

      <button
        className="px-4 py-2 font-bold text-white bg-stargaze rounded-md"
        onClick={() => {
          fetch(snapshotEndpoint)
            .then((response) => response.json())
            .then((data) => {
              if (data.length === 0) {
                toast.error('Could not fetch snapshot data for the given collection address.', {
                  style: { maxWidth: 'none' },
                })
                return
              }
              if (exportIndividualTokens) {
                const csv = `address,tokenId\n${data
                  ?.map((row: any) => {
                    if (!includeListed && row.is_listed) return ''
                    if (!includeStaked && row.is_staked) return ''
                    return `${row.owner_addr},${row.token_id}\n`
                  })
                  .join('')}`
                download(csv, 'snapshot.csv', 'text/csv')
                return
              }
              const aggregatedData: any[] = []
              data.forEach((row: any) => {
                if (!includeListed && row.is_listed) return
                if (!includeStaked && row.is_staked) return
                const existingRow = aggregatedData.find((r) => r.address === row.owner_addr)
                if (existingRow) {
                  existingRow.amount += 1
                } else {
                  aggregatedData.push({ address: row.owner_addr, amount: 1 })
                }
              })

              aggregatedData.sort((a, b) => b.amount - a.amount)
              const csv = `address,amount\n${aggregatedData.map((row: any) => Object.values(row).join(',')).join('\n')}`
              download(csv, 'snapshot.csv', 'text/csv')
            })
            .catch((err) => {
              toast.error(`Could not fetch snapshot data: ${err}`, {
                style: { maxWidth: 'none' },
              })
              console.error('Could not fetch snapshot data: ', err)
            })
        }}
      >
        {' '}
        Export Snapshot
      </button>
    </section>
  )
}

export default withMetadata(Snapshots, { center: false })
