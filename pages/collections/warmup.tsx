import axios from 'axios'
import { Button } from 'components/Button'
import { dispatchQuery } from 'components/collections/queries/query'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import Lister from 'components/Lister'
import { useContracts } from 'contexts/contracts'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CollectionQueriesPage: NextPage = () => {
  const { baseMinter: baseMinterContract, vendingMinter: vendingMinterContract, sg721: sg721Contract } = useContracts()
  const type = 'config'
  const sg721ContractAddress = `sg721ContractState.value`
  const [doneList, setDoneList] = useState<number[]>([])
  const [processList, setProcessList] = useState<number[]>([])
  const [numTokens, setNumTokens] = useState(0)
  const [pers, setPers] = useState(0)
  const minterContractState = useInputState({
    id: 'minter-contract-address',
    name: 'minter-contract-address',
    title: 'Minter Address',
    subtitle: 'Address of the Minter contract',
  })
  const minterContractAddress = minterContractState.value

  const vendingMinterMessages = useMemo(
    () => vendingMinterContract?.use(minterContractAddress),
    [vendingMinterContract, minterContractAddress],
  )
  const baseMinterMessages = useMemo(
    () => baseMinterContract?.use(minterContractAddress),
    [baseMinterContract, minterContractAddress],
  )
  const sg721Messages = useMemo(() => sg721Contract?.use(sg721ContractAddress), [sg721Contract, sg721ContractAddress])

  const { data: response } = useQuery(
    [sg721Messages, baseMinterMessages, vendingMinterMessages, type] as const,
    async ({ queryKey }) => {
      const [_sg721Messages, _baseMinterMessages_, _vendingMinterMessages, _type] = queryKey
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await dispatchQuery({
        vendingMinterMessages: _vendingMinterMessages,
        baseMinterMessages: _baseMinterMessages_,
        sg721Messages: _sg721Messages,
        type: _type,
      })
      return result
    },
    {
      placeholderData: null,
      onError: (error: any) => {
        toast.error(error.message, { style: { maxWidth: 'none' } })
      },
      enabled: Boolean(sg721ContractAddress && minterContractAddress && type),
      retry: false,
    },
  )

  useEffect(() => {
    if (response) {
      setNumTokens(response['num_tokens'])
      setPers(0)
    }
  }, [response])

  useEffect(() => {
    if (numTokens !== 0) setPers((100 * doneList.length) / numTokens)
    else setPers(0)
  }, [doneList.length, numTokens])

  function chooseAlternate(url: string, attempt: number) {
    let alternate
    switch (attempt) {
      case 1: {
        alternate = url.replace('ipfs://', 'https://ipfs.stargaze.zone/ipfs/')
        break
      }
      case 2: {
        alternate = url.replace('ipfs://', 'https://ipfs.io/ipfs/')
        break
      }
      case 3: {
        alternate = url.replace('ipfs://', 'https://cf-ipfs.com/ipfs/')
        break
      }
      default: {
        alternate = url.replace('ipfs://', 'https://ipfs-gw.stargaze-apis.com/ipfs/')
        break
      }
    }
    return alternate
  }

  async function warmOne(i: number, image: string, attempt: number, totalAttempt: number) {
    setProcessList((existingItems) => {
      return [i, ...existingItems]
    })
    const link = image.replace('1', i.toString())

    try {
      const result = await axios.get(chooseAlternate(link, attempt))

      if (result.status === 200) {
        setDoneList((existingItems) => {
          return [i, ...existingItems]
        })
        setProcessList((existingItems) => {
          const index = existingItems.indexOf(i, 0)
          if (index > -1) {
            existingItems.splice(index, 1)
          }
          return existingItems
        })
        return
      }
    } catch (e) {
      console.log('hata: ', i, e)
    }
    if (totalAttempt !== 4) {
      void warmOne(i, image, attempt === 3 ? 0 : attempt + 1, attempt === 3 ? totalAttempt + 1 : totalAttempt)
    }
  }

  async function warmingProcess(url: string, attempt: number) {
    const link = `${chooseAlternate(url, attempt)}/1`
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data, status } = await axios.get(link)
      if (status === 200) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        for (let i = 1; i <= response['num_tokens']; i++) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          void warmOne(i, data.image, 0, 0)
        }
      } else if (attempt < 3) {
        void warmingProcess(url, attempt + 1)
      } else toast.error('File can not be reachable at the moment! Please try again later...')
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Warm Up Your Collection" />
      <ContractPageHeader
        description="Here you can warm up your collection items"
        link={links.Documentation}
        title="Warm Up Collection Items"
      />
      <div className="space-y-8">
        <AddressInput {...minterContractState} />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col mr-20 w-4/5 text-xl border border-stargaze">
          <div className="flex flex-row w-full text-center">
            <div className="w-1/3">Total</div>
            <div className="w-1/3">Warmed</div>
            <div className="w-1/3">Percentage</div>
          </div>
          <div className="flex flex-row w-full text-center">
            <div className="w-1/3">{numTokens}</div>
            <div className="w-1/3">{doneList.length}</div>
            <div className="w-1/3">{(Math.round(pers * 100) / 100).toFixed(2)}%</div>
          </div>
        </div>
        <div>
          <Button
            isDisabled={!response}
            onClick={() => {
              void warmingProcess(response['base_token_uri'], 0)
            }}
          >
            Start
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 p-4 space-x-8">
        {processList.map((value: number, index: number) => {
          return <Lister key={index.toString()} data={value.toString()} />
        })}
      </div>
    </section>
  )
}

export default withMetadata(CollectionQueriesPage, { center: false })
