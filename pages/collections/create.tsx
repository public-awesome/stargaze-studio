import Anchor from 'components/Anchor'
import { CollectionInfo } from 'components/CollectionInfo'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const UploadPage: NextPage = () => {
  return (
    <div>
      <NextSeo title="Create Collection" />

      <div className="mt-5 space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Create Collection</h1>

        <p>
          Make sure you check our{' '}
          <Anchor className="font-bold text-plumbus hover:underline" href={links['Docs']}>
            documentation
          </Anchor>{' '}
          on how to create your collection
        </p>
      </div>

      <hr className="border-white/20" />

      <CollectionInfo />
    </div>
  )
}

export default withMetadata(UploadPage, { center: false })
