/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
export type AssetType = 'image' | 'audio' | 'video' | 'unknown'

export const getAssetType = (assetFileName: string): AssetType => {
  const assetType = assetFileName?.split('.').pop() || 'unknown'
  if (assetType === 'png' || assetType === 'jpg' || assetType === 'jpeg' || assetType === 'svg') return 'image'
  if (assetType === 'mp3' || assetType === 'wav') return 'audio'
  if (assetType === 'mp4') return 'video'
  return 'unknown'
}
