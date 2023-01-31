/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import axios from 'axios'
import { Button } from 'components/Button'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import type { AppConfig } from 'config'
import { getConfig } from 'config'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { NETWORK } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

interface ConfigResponse {
  num_tokens: number
  base_token_uri: string
}

const CollectionQueriesPage: NextPage = () => {
  const [client, setClient] = useState<CosmWasmClient>()
  const [baseUri, SetBaseUri] = useState('')
  const [doneCount, setDoneCount] = useState(0)
  const [errorList, setErrorList] = useState<number[]>([])
  const [numTokens, setNumTokens] = useState(0)
  const [percentage, setPercentage] = useState('0.00')
  const [isLoading, setIsLoading] = useState(false)
  const minterContractState = useInputState({
    id: 'minter-contract-address',
    name: 'minter-contract-address',
    title: 'Minter Contract Address',
    defaultValue: '',
    placeholder: 'stars1...',
  })
  const minterContractAddress = minterContractState.value

  const router = useRouter()

  useEffect(() => {
    async function init() {
      const config: AppConfig = getConfig(NETWORK)
      setClient(await CosmWasmClient.connect(config.rpcUrl))
    }
    void init()
  }, [])

  useEffect(() => {
    async function get() {
      if (client && minterContractAddress) {
        const res: ConfigResponse = await client.queryContractSmart(minterContractAddress, {
          config: {},
        })
        setNumTokens(res.num_tokens)
        SetBaseUri(res.base_token_uri)
        setPercentage('0.00')
        setDoneCount(0)
        setErrorList([])
      }
    }
    void get()
  }, [minterContractAddress, client])

  useEffect(() => {
    if (minterContractAddress.length > 0) {
      void router.replace({ query: { minterContractAddress } })
    }
  }, [minterContractAddress])

  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('minterContractAddress')
    if (initial && initial.length > 0) minterContractState.onChange(initial)
  }, [])

  useEffect(() => {
    if (doneCount === numTokens) setIsLoading(false)
    if (numTokens !== 0) setPercentage(((doneCount / numTokens) * 100).toFixed(2))
    else setPercentage('0.00')
  }, [doneCount, numTokens])

  function chooseAlternate(url: string, attempt: number) {
    let alternate
    switch (attempt) {
      case 1: {
        alternate = url.replace('ipfs://', 'https://cf-ipfs.com/ipfs/')
        break
      }
      case 2: {
        alternate = url.replace('ipfs://', 'https://ipfs.io/ipfs/')
        break
      }
      case 3: {
        alternate = url.replace('ipfs://', 'https://ipfs-gw.stargaze-apis.com/ipfs/')
        break
      }
      default: {
        alternate = url.replace('ipfs://', 'https://ipfs.stargaze.zone/ipfs/')
        break
      }
    }
    return alternate
  }

  async function warmOne(i: number, image: string, attempt: number, totalAttempt: number) {
    const link = image.replace('1', i.toString())

    try {
      const result = await axios.get(chooseAlternate(link, attempt))

      if (result.status === 200) {
        setDoneCount((count) => {
          return count + 1
        })
        return
      }
    } catch (e) {
      toast.error(e as string)
    }
    if (totalAttempt !== 4) {
      void warmOne(i, image, attempt === 3 ? 0 : attempt + 1, attempt === 3 ? totalAttempt + 1 : totalAttempt)
    } else {
      setErrorList((existingItems) => {
        return [i, ...existingItems]
      })
      setDoneCount((count) => {
        return count + 1
      })
    }
  }

  async function warmingProcess(url: string, attempt: number, err: boolean) {
    const link = `${chooseAlternate(url, attempt)}/1`
    try {
      const { data, status } = await axios.get(link)
      if (status === 200) {
        if (!err) {
          for (let i = 1; i <= numTokens; i++) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            void warmOne(i, data.image, 0, 0)
          }
        } else {
          const list = errorList
          setErrorList([])
          list.forEach((i) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            void warmOne(i, data.image, 0, 0)
          })
        }
      } else if (attempt < 3) {
        void warmingProcess(url, attempt + 1, err)
      } else toast.error('File can not be reachable at the moment! Please try again later...')
    } catch (e) {
      toast.error(e as string)
    }
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Collection Warm Up" />
      <ContractPageHeader
        description="Here you can pre-warm your collection for improved IPFS performance."
        link={links.Documentation}
        title="Collection Warm Up"
      />
      <div className="space-y-8">
        <AddressInput {...minterContractState} />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col mr-20 w-4/5 text-xl border border-stargaze">
          <div className="flex flex-row mt-2 w-full text-center">
            <div className="w-1/3">Total</div>
            <div className="w-1/3">Done</div>
            <div className="w-1/3">Error</div>
            <div className="w-1/3">Percentage</div>
          </div>
          <div className="flex flex-row w-full text-center">
            <div className="w-1/3">{numTokens}</div>
            <div className="w-1/3">{doneCount}</div>
            <div className="w-1/3">{errorList.length}</div>
            <div className="w-1/3">{percentage}%</div>
          </div>
          <div className="flex justify-center w-full">
            <progress className="my-5 mx-2 w-4/5 h-2 progress" max="100" value={percentage} />
          </div>
        </div>
        <div className="flex flex-row content-center p-10">
          <Button
            isDisabled={baseUri === ''}
            isLoading={isLoading}
            onClick={() => {
              setIsLoading(true)
              if (errorList.length === 0) {
                setDoneCount(0)
                setErrorList([])
                void warmingProcess(baseUri, 0, false)
              } else {
                setDoneCount(doneCount - errorList.length)
                void warmingProcess(baseUri, 0, true)
              }
            }}
          >
            {(numTokens === 0 || errorList.length === 0) && <span>Start</span>}
            {numTokens !== 0 && errorList.length > 0 && <span>Start</span>}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default withMetadata(CollectionQueriesPage, { center: false })
