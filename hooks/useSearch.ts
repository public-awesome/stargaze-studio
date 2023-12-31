/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable import/no-default-export */
import { useQuery } from 'react-query'
import { MEILISEARCH_API_KEY, MEILISEARCH_HOST } from 'utils/constants'

export default function useSearch(query: string, includeUids: string[] = [], limit: number = 4) {
  return useQuery<SearchResult[] | null>(
    ['globalSearch', query],
    async () => await getSearchResults(query, includeUids, limit),
  )
}

async function getSearchResults(query: string, includeUids: string[], limit: number) {
  let queries = [
    {
      indexUid: 'collections',
      sort: query === '' ? ['score_1d:desc'] : [],
      q: query ?? '',
      limit,
    },
    {
      indexUid: 'names',
      q: query ?? '',
      limit,
    },
  ]
  if (includeUids.length) {
    queries = queries.filter((query) => includeUids.includes(query.indexUid))
  }

  try {
    const response = (await fetch(`${MEILISEARCH_HOST}/multi-search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queries,
      }),
    }).then((res) => res.json())) as SearchResponse

    return response.results
  } catch (e) {
    console.log('error', e)
    return null
  }
}

export interface SearchResult {
  indexUid: string
  hits: Hit[]
  estimatedTotalHits: number
  limit: number
  offset: number
  processingTimeMs: number
  query: string
}

export interface SearchResponse {
  results: SearchResult[]
}

export interface Hit {
  created_by: string
  description: string
  id: string
  collection_uri: string
  image_url: string
  minting: boolean
  minter: string
  name: string
  thumbnail_url: string
  tokens_count: number
  type: string
  // name
  address: string
  profile_picture: string
  profile_picture_thumbnail: string
  twitter_acct: string
  verified: boolean
}
