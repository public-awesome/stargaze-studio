/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
export type AssetType = 'image' | 'audio' | 'video' | 'html' | 'unknown'

export const getAssetType = (assetFileName: string): AssetType => {
  const assetType = assetFileName?.toLowerCase().split('.').pop() || 'unknown'
  if (assetType === 'png' || assetType === 'jpg' || assetType === 'jpeg' || assetType === 'svg' || assetType === 'gif')
    return 'image'
  if (assetType === 'mp3' || assetType === 'wav') return 'audio'
  if (assetType === 'mp4') return 'video'
  if (assetType === 'html') return 'html'
  return 'unknown'
}
