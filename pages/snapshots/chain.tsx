/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable tailwindcss/classnames-order */

import { Button } from 'components/Button'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { LinkTabs } from 'components/LinkTabs'
import { snapshotLinkTabs } from 'components/LinkTabs.data'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import toast from 'react-hot-toast'
// import Brand from 'public/brand/brand.svg'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

export interface ChainDataType {
  type: 'active-users'
  endpoint: string
}

const Chain: NextPage = () => {
  const activeUsersEndpoint = `https://metabase.constellations.zone/public/question/cc17fce5-3cc4-4b03-b100-81bdf982f391.json`
  const [chainDataType, setChainDataType] = useState<ChainDataType>({
    type: 'active-users',
    endpoint: activeUsersEndpoint,
  })
  const [isLoading, setIsLoading] = useState(false)

  const download = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a')
    const file = new Blob([content], { type: contentType })
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
  }

  return (
    <section className="px-4 pt-4 pb-16 mx-auto space-y-8 ml-8 w-full">
      <NextSeo title="Snapshots" />
      <ContractPageHeader
        description="Here you can export the snapshot of the holders for a collection."
        link={links.Documentation}
        title="Snapshots"
      />
      <LinkTabs activeIndex={0} data={snapshotLinkTabs} />
      <div className="flex flex-col w-1/4">
        <span className="text-lg font-bold text-white">Chain Data Type</span>
        <select
          className="mt-2 pt-2 pb-2 px-4 placeholder:text-white/50 bg-white/10 rounded border-2 border-white/20 focus:ring focus:ring-plumbus-20"
          onChange={(e) => setChainDataType(JSON.parse(e.target.value))}
        >
          <option value={JSON.stringify({ type: 'active-users', endpoint: activeUsersEndpoint })}>
            Active Stargaze Users
          </option>
        </select>
      </div>

      <Button
        className="px-4 py-2 mt-4 font-bold text-white bg-stargaze rounded-md"
        isLoading={isLoading}
        onClick={() => {
          setIsLoading(true)
          fetch(chainDataType.endpoint)
            .then((response) => response.json())
            .then((data) => {
              if (data.length === 0) {
                toast.error('Could not fetch snapshot data for the given collection address.', {
                  style: { maxWidth: 'none' },
                })
                setIsLoading(false)
                return
              }
              if (chainDataType.type === 'active-users') {
                const addresses = data.map((item: any) => item.address)
                download(addresses.join('\n'), 'active-users.txt', 'text/plain')
              }
              setIsLoading(false)
            })
            .catch((err) => {
              setIsLoading(false)
              toast.error(`Could not fetch chain data: ${err}`, {
                style: { maxWidth: 'none' },
              })
              console.error('Could not fetch chain data: ', err)
            })
        }}
      >
        {' '}
        Export List
      </Button>
    </section>
  )
}

export default withMetadata(Chain, { center: false })
