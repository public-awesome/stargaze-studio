/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { useMetadataAttributesState } from 'components/forms/MetadataAttributes.hooks'
import { useEffect, useMemo, useState } from 'react'

import { TextInput } from './forms/FormInput'
import { useInputState } from './forms/FormInput.hooks'
import { MetadataAttributes } from './forms/MetadataAttributes'

export interface MetadataInputProps {
  selectedAssetFile: File
  selectedMetadataFile: File
  updateMetadataToUpload: (metadataFile: File) => void
  onChange?: (metadata: any) => void
  importedMetadata?: any
}

export const MetadataInput = (props: MetadataInputProps) => {
  const emptyMetadataFile = new File(
    [JSON.stringify({})],
    `${props.selectedAssetFile?.name
      .substring(0, props.selectedAssetFile?.name.lastIndexOf('.'))
      .replaceAll('#', '')}.json`,
    { type: 'application/json' },
  )

  const [metadata, setMetadata] = useState<any>(null)

  const nameState = useInputState({
    id: 'name',
    name: 'name',
    title: 'Name',
    placeholder: 'Token name',
  })

  const descriptionState = useInputState({
    id: 'description',
    name: 'description',
    title: 'Description',
    placeholder: 'Token description',
  })

  const externalUrlState = useInputState({
    id: 'externalUrl',
    name: 'externalUrl',
    title: 'External URL',
    placeholder: 'https://',
  })

  const youtubeUrlState = useInputState({
    id: 'youtubeUrl',
    name: 'youtubeUrl',
    title: 'Youtube URL',
    placeholder: 'https://',
  })

  const attributesState = useMetadataAttributesState()

  let parsedMetadata: any
  const parseMetadata = async (metadataFile: File) => {
    console.log(metadataFile.size)
    console.log(`Parsing metadataFile...`)
    if (metadataFile) {
      attributesState.reset()
      try {
        parsedMetadata = JSON.parse(await metadataFile.text())
      } catch (e) {
        console.log(e)
        return
      }
      console.log('Parsed metadata: ', parsedMetadata)

      if (!parsedMetadata.attributes || parsedMetadata.attributes?.length === 0) {
        attributesState.reset()
        attributesState.add({
          trait_type: '',
          value: '',
        })
      } else {
        attributesState.reset()
        for (let i = 0; i < parsedMetadata.attributes?.length; i++) {
          attributesState.add({
            trait_type: parsedMetadata.attributes[i].trait_type,
            value: parsedMetadata.attributes[i].value,
          })
        }
      }
      if (!parsedMetadata.name) {
        nameState.onChange('')
      } else {
        nameState.onChange(parsedMetadata.name)
      }
      if (!parsedMetadata.description) {
        descriptionState.onChange('')
      } else {
        descriptionState.onChange(parsedMetadata.description)
      }
      if (!parsedMetadata.external_url) {
        externalUrlState.onChange('')
      } else {
        externalUrlState.onChange(parsedMetadata.external_url)
      }
      if (!parsedMetadata.youtube_url) {
        youtubeUrlState.onChange('')
      } else {
        youtubeUrlState.onChange(parsedMetadata.youtube_url)
      }
      setMetadata(parsedMetadata)
    } else {
      attributesState.reset()
      nameState.onChange('')
      descriptionState.onChange('')
      externalUrlState.onChange('')
      youtubeUrlState.onChange('')
      attributesState.add({
        trait_type: '',
        value: '',
      })
      setMetadata(null)
      props.updateMetadataToUpload(emptyMetadataFile)
    }
  }

  const generateUpdatedMetadata = () => {
    metadata.attributes = Object.values(attributesState)[1]
    metadata.attributes = metadata.attributes.filter((attribute: { trait_type: string }) => attribute.trait_type !== '')

    if (metadata.attributes.length === 0) delete metadata.attributes
    if (nameState.value === '') delete metadata.name
    else metadata.name = nameState.value
    if (descriptionState.value === '') delete metadata.description
    else metadata.description = descriptionState.value.replaceAll('\\n', '\n')
    if (externalUrlState.value === '') delete metadata.external_url
    else metadata.external_url = externalUrlState.value
    if (youtubeUrlState.value === '') delete metadata.youtube_url
    else metadata.youtube_url = youtubeUrlState.value

    const metadataFileBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    })

    const editedMetadataFile = new File(
      [metadataFileBlob],
      props.selectedMetadataFile?.name
        ? props.selectedMetadataFile?.name.replaceAll('#', '')
        : `${props.selectedAssetFile?.name
            .substring(0, props.selectedAssetFile?.name.lastIndexOf('.'))
            .replaceAll('#', '')}.json`,
      { type: 'application/json' },
    )
    props.updateMetadataToUpload(editedMetadataFile)
    //console.log(editedMetadataFile)
    //console.log(`${props.assetFile?.name.substring(0, props.assetFile?.name.lastIndexOf('.'))}.json`)
  }

  useEffect(() => {
    console.log(props.selectedMetadataFile?.name)
    if (props.selectedMetadataFile) {
      void parseMetadata(props.selectedMetadataFile)
    } else if (!props.importedMetadata) {
      void parseMetadata(emptyMetadataFile)
    }
  }, [props.selectedMetadataFile?.name, props.importedMetadata])

  const nameStateMemo = useMemo(() => nameState, [nameState.value])
  const descriptionStateMemo = useMemo(() => descriptionState, [descriptionState.value])
  const externalUrlStateMemo = useMemo(() => externalUrlState, [externalUrlState.value])
  const youtubeUrlStateMemo = useMemo(() => youtubeUrlState, [youtubeUrlState.value])
  const attributesStateMemo = useMemo(() => attributesState, [attributesState.entries])

  useEffect(() => {
    console.log('Update metadata')
    if (metadata) {
      generateUpdatedMetadata()
      if (props.onChange) props.onChange(metadata)
    }
    console.log(metadata)
  }, [
    nameStateMemo.value,
    descriptionStateMemo.value,
    externalUrlStateMemo.value,
    youtubeUrlStateMemo.value,
    attributesStateMemo.entries,
  ])

  useEffect(() => {
    if (props.importedMetadata) {
      void parseMetadata(emptyMetadataFile).then(() => {
        console.log('Imported metadata: ', props.importedMetadata)
        nameState.onChange(props.importedMetadata.name || '')
        descriptionState.onChange(props.importedMetadata.description || '')
        externalUrlState.onChange(props.importedMetadata.external_url || '')
        youtubeUrlState.onChange(props.importedMetadata.youtube_url || '')
        if (props.importedMetadata?.attributes && props.importedMetadata?.attributes?.length > 0) {
          attributesState.reset()
          props.importedMetadata?.attributes?.forEach((attribute: { trait_type: string; value: string }) => {
            attributesState.add({
              trait_type: attribute.trait_type,
              value: attribute.value,
            })
          })
        } else {
          attributesState.reset()
          attributesState.add({
            trait_type: '',
            value: '',
          })
        }
      })
    }
  }, [props.importedMetadata])

  return (
    <div>
      <div className="grid grid-cols-2 mt-4 mr-4 ml-8 w-full max-w-6xl max-h-full no-scrollbar">
        <div className="mr-4">
          <div className="mb-7 text-xl font-bold underline underline-offset-4">NFT Metadata</div>
          <TextInput {...nameState} />
          <TextInput className="mt-2" {...descriptionState} />
          <TextInput className="mt-2" {...externalUrlState} />
          <TextInput className="mt-2" {...youtubeUrlState} />
        </div>
        <div className="mt-6">
          <MetadataAttributes
            attributes={attributesState.entries}
            onAdd={attributesState.add}
            onChange={attributesState.update}
            onRemove={attributesState.remove}
            title="Attributes"
          />
        </div>
      </div>
    </div>
  )
}
