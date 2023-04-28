import type { WhitelistFlexMember } from 'components/WhitelistFlexUpload'

export const csvToFlexList = (str: string, delimiter = ',') => {
  let newline = '\n'
  if (str.includes('\r')) newline = '\r'
  if (str.includes('\r\n')) newline = '\r\n'

  const headers = str.slice(0, str.indexOf(newline)).split(delimiter)
  if (headers.length !== 2) {
    throw new Error('Invalid whitelist-flex file.')
  }
  if (headers[0] !== 'address' || headers[1] !== 'mint_count') {
    throw new Error('Invalid whitelist-flex file. Headers must be "address" and "mint_count".')
  }

  const rows = str.slice(str.indexOf('\n') + 1).split(newline)

  const arr = rows
    .filter((row) => row !== '')
    .map((row) => {
      const values = row.split(delimiter)
      const el = headers.reduce((object, header, index) => {
        // @ts-expect-error assume object as Record<string, unknown>
        object[header] = values[index]
        return object
      }, {})
      return el
    })

  return arr as WhitelistFlexMember[]
}
