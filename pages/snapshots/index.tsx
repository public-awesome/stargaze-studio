/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable react/button-has-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
// import Brand from 'public/brand/brand.svg'
import { withMetadata } from 'utils/layout'

import SelectCollectionModal from './SelectCollectionModal'

const Snapshots: NextPage = () => {
  const [collectionAddress, setCollectionAddress] = useState<string>('')
  const collectionAddressState = useInputState({
    id: 'collection-address',
    name: 'collection-address',
    title: 'Collection Address',
    defaultValue: '',
  })

  const snapshotEndpoint = `https://metabase.constellations.zone/api/public/card/b5764fb2-9a23-4ecf-866b-dec79c4c461e/query/json?parameters=%5B%7B%22type%22%3A%22category%22%2C%22value%22%3A%22${collectionAddressState.value}%22%2C%22id%22%3A%22cb34b7a8-70cf-ba86-8d9c-360b5b2fedd3%22%2C%22target%22%3A%5B%22variable%22%2C%5B%22template-tag%22%2C%22collection_addr%22%5D%5D%7D%5D`
  // function to download .json from the endpoint
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
        description="Here you can export the snapshot of a collection's holders."
        link=""
        title="Snapshots"
      />
      <SelectCollectionModal selectCollection={setCollectionAddress} />
      <AddressInput className="w-3/4" {...collectionAddressState} />
      <button
        className="px-4 py-2 font-bold text-white bg-stargaze rounded-md"
        onClick={() => {
          fetch(snapshotEndpoint)
            .then((response) => response.json())
            // data = [{"address":"stars15y38ehvexp6275ptmm4jj3qdds379nk07tw95r","num_owned":271}]
            // export a csv file with adding the header address,amount at the top from the array in the json
            .then((data) => {
              if (data.length === 0) {
                toast.error('No holders were found for the given collection address.')
                return
              }
              const csv = `address,amount\n${data.map((row: any) => Object.values(row).join(',')).join('\n')}`
              download(csv, 'snapshot.csv', 'text/csv')
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
