/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { useMetadataAttributesState } from 'components/forms/MetadataAttributes.hooks'
import { useEffect, useState } from 'react'

import Button from './Button'
import { TextInput } from './forms/FormInput'
import { useInputState } from './forms/FormInput.hooks'
import { MetadataAttributes } from './forms/MetadataAttributes'
import { MetadataFormGroup } from './MetadataFormGroup'

export interface MetadataModalProps {
  imageFile: File
  metadataFile: File
  updateMetadata: (metadataFile: File) => void
  updatedMetadataFile: File
  refresher: boolean
}

export const MetadataModal = (props: MetadataModalProps) => {
  const metadataFile: File = props.metadataFile
  const updatedMetadataFile: File = props.updatedMetadataFile
  const [metadata, setMetadata] = useState<any>(null)
  const [imageURL, setImageURL] = useState<string>('')

  let parsedMetadata: any
  const parseMetadata = async () => {
    if (metadataFile) {
      attributesState.reset()
      parsedMetadata = JSON.parse(await metadataFile.text())

      for (let i = 0; i < parsedMetadata.attributes.length; i++) {
        attributesState.add({
          trait_type: parsedMetadata.attributes[i].trait_type,
          value: parsedMetadata.attributes[i].value,
        })
      }
      nameState.onChange(parsedMetadata.name)
      descriptionState.onChange(parsedMetadata.description)
      externalUrlState.onChange(parsedMetadata.external_url)

      setMetadata(parsedMetadata)
    }
    if (updatedMetadataFile) {
      const parsedUpdatedMetadata = JSON.parse(await updatedMetadataFile.text())
      setImageURL(parsedUpdatedMetadata.image)
    }
  }

  const nameState = useInputState({
    id: 'name',
    name: 'name',
    title: 'Name',
    placeholder: 'Token name',
    defaultValue: metadata?.name,
  })

  const descriptionState = useInputState({
    id: 'description',
    name: 'description',
    title: 'Description',
    placeholder: 'Token description',
    defaultValue: metadata?.description,
  })

  const externalUrlState = useInputState({
    id: 'externalUrl',
    name: 'externalUrl',
    title: 'External URL',
    placeholder: 'https://',
    defaultValue: metadata?.external_url,
  })

  const imageState = useInputState({
    id: 'image',
    name: 'image',
    title: 'Image',
    placeholder: 'Not uploaded yet.',
    defaultValue: imageURL,
  })

  const attributesState = useMetadataAttributesState()

  const generateUpdatedMetadata = () => {
    console.log(`Current parsed data: ${parsedMetadata}`)
    console.log('Updating...')

    metadata.attributes = Object.values(attributesState)[1]
    metadata.attributes = metadata.attributes.filter((attribute: { trait_type: string }) => attribute.trait_type !== '')

    metadata.name = nameState.value
    metadata.description = descriptionState.value
    metadata.external_url = externalUrlState.value

    const metadataFileBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    })

    const editedMetadataFile = new File([metadataFileBlob], metadataFile.name, { type: 'application/json' })
    props.updateMetadata(editedMetadataFile)
  }

  useEffect(() => {
    void parseMetadata()
  }, [props.metadataFile, props.refresher])

  return (
    <div>
      <input className="modal-toggle" id="my-modal-4" type="checkbox" />
      <label className="cursor-pointer modal" htmlFor="my-modal-4">
        <label
          className="absolute top-5 bottom-5 w-full max-w-5xl max-h-full border-2 no-scrollbar modal-box"
          htmlFor="temp"
        >
          <MetadataFormGroup
            relatedAsset={props.imageFile}
            subtitle={`Asset name: ${props.imageFile?.name}`}
            title="Update Metadata"
          >
            <TextInput {...nameState} onChange={(e) => nameState.onChange(e.target.value)} />
            <TextInput {...descriptionState} onChange={(e) => descriptionState.onChange(e.target.value)} />
            <TextInput {...externalUrlState} onChange={(e) => externalUrlState.onChange(e.target.value)} />
            <TextInput {...imageState} disabled value={imageURL} />
            <MetadataAttributes
              attributes={attributesState.entries}
              onAdd={attributesState.add}
              onChange={attributesState.update}
              onRemove={attributesState.remove}
              subtitle="Enter trait types and values"
              title="Attributes"
            />
            <Button isDisabled={!props.metadataFile} onClick={generateUpdatedMetadata}>
              Update Metadata
            </Button>
          </MetadataFormGroup>
        </label>
      </label>
    </div>
  )
}
