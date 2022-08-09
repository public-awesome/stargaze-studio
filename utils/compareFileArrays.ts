export const compareFileArrays = (assetFilesArray: File[], metadataFilesArray: File[]) => {
  const metadataFileNames = metadataFilesArray.map((file) => file.name.substring(0, file.name.lastIndexOf('.')))
  const assetFileNames = assetFilesArray.map((file) => file.name.substring(0, file.name.lastIndexOf('.')))
  // Compare the two arrays to make sure they are the same
  const areArraysEqual = metadataFileNames.every((val, index) => val === assetFileNames[index])
  if (!areArraysEqual) {
    throw new Error('Asset and metadata file names do not match.')
  }
}
