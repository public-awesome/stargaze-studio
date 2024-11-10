/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-nested-ternary */

/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { toUtf8 } from '@cosmjs/encoding'
import clsx from 'clsx'
import { Button } from 'components/Button'
import type { WhitelistType } from 'components/collections/creation/WhitelistDetails'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { whitelistLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import type { QueryType } from 'contracts/whitelist/messages/query'
import { dispatchQuery, QUERY_LIST } from 'contracts/whitelist/messages/query'
import type { WhitelistMerkleTreeQueryType } from 'contracts/whitelistMerkleTree/messages/query'
import {
  dispatchQuery as disptachWhitelistMerkleTreeQuery,
  WHITELIST_MERKLE_TREE_QUERY_LIST,
} from 'contracts/whitelistMerkleTree/messages/query'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import { WHITELIST_MERKLE_TREE_API_URL } from 'utils/constants'
import { useDebounce } from 'utils/debounce'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'
import { resolveAddress } from 'utils/resolveAddress'
import { useWallet } from 'utils/wallet'

const WhitelistQueryPage: NextPage = () => {
  const { whitelist: contract } = useContracts()
  const { whitelistMerkleTree: contractWhitelistMerkleTree } = useContracts()
  const wallet = useWallet()
  const [exporting, setExporting] = useState(false)
  const [whitelistType, setWhitelistType] = useState<WhitelistType>('standard')
  const [proofHashes, setProofHashes] = useState<string[]>([])

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'Whitelist Address',
    subtitle: 'Address of the Whitelist contract',
  })
  const contractAddress = contractState.value

  const debouncedWhitelistContractState = useDebounce(contractAddress, 300)

  useEffect(() => {
    async function getWhitelistContractType() {
      if (debouncedWhitelistContractState.length > 0) {
        const client = await wallet.getCosmWasmClient()
        const data = await toast.promise(
          client.queryContractRaw(
            debouncedWhitelistContractState,
            toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
          ),
          {
            loading: 'Retrieving whitelist type...',
            error: 'Whitelist type retrieval failed.',
            success: 'Whitelist type retrieved.',
          },
        )
        const whitelistContract: string = JSON.parse(new TextDecoder().decode(data as Uint8Array)).contract
        console.log(contract)
        return whitelistContract
      }
    }
    void getWhitelistContractType()
      .then((whitelistContract) => {
        if (whitelistContract?.includes('merkletree')) {
          setWhitelistType('merkletree')
        } else if (whitelistContract?.includes('flex')) {
          setWhitelistType('flex')
        } else {
          setWhitelistType('standard')
        }
      })
      .catch((err) => {
        console.log(err)
        setWhitelistType('standard')
        console.log('Unable to retrieve contract type. Defaulting to "standard".')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedWhitelistContractState, wallet.isWalletConnected])

  const addressState = useInputState({
    id: 'address',
    name: 'address',
    title: 'Address',
    subtitle: 'Address of the user - defaults to current address',
  })
  const address = addressState.value

  const debouncedAddress = useDebounce(address, 300)

  const fetchProofHashes = async (whitelistContractAddress: string, memberAddress: string): Promise<string[]> => {
    if (whitelistContractAddress.length === 0 || memberAddress.length === 0)
      throw new Error('Contract or member address is empty.')
    const resolvedAddress = await resolveAddress(memberAddress, wallet)
    const merkleRootResponse = await (
      await wallet.getCosmWasmClient()
    ).queryContractSmart(contractAddress, { merkle_root: {} })
    const proofs = await toast.promise(
      fetch(`${WHITELIST_MERKLE_TREE_API_URL}/whitelist/${merkleRootResponse.merkle_root}/${resolvedAddress}`)
        .then((res) => res.json())
        .then((data) => data.proofs)
        .catch((e) => {
          console.log(e)
          setProofHashes([])
        }),
      {
        loading: 'Fetching proof hashes...',
        error: 'Error fetching proof hashes from Whitelist Merkle Tree API.',
        success: 'Proof hashes fetched.',
      },
    )
    return proofs as string[] | []
  }

  useEffect(() => {
    if (
      whitelistType === 'merkletree' &&
      whitelistMerkleTreeQueryType === 'has_member' &&
      debouncedAddress.length > 0
    ) {
      void fetchProofHashes(contractAddress, debouncedAddress)
        .then((proofs) => setProofHashes(proofs))
        .catch((e) => {
          console.log(e)
          setProofHashes([])
        })
    }
  }, [debouncedAddress])

  const stageId = useNumberInputState({
    id: 'stage-number',
    name: 'stage-number',
    title: 'Stage Number',
    defaultValue: 1,
  })

  const limit = useNumberInputState({
    id: 'limit',
    name: 'limit',
    title: 'Limit',
    subtitle: 'Maximum number of addresses to return',
    defaultValue: 20,
  })

  const debouncedLimit = useDebounce(limit.value, 500)

  const startAfter = useInputState({
    id: 'start-after',
    name: 'start-after',
    title: 'Start After',
    subtitle: 'Address to start after',
  })

  useEffect(() => {
    if (debouncedLimit > 100) {
      toast.success('Only 100 addresses can be returned at a time even if the limit is higher.', {
        style: { maxWidth: 'none' },
        icon: '📝',
        duration: 5000,
      })
    }
  }, [debouncedLimit])

  const [type, setType] = useState<QueryType>('config')
  const [whitelistMerkleTreeQueryType, setWhitelistMerkleTreeQueryType] =
    useState<WhitelistMerkleTreeQueryType>('config')

  const addressVisible =
    type === 'has_member' ||
    type === 'stage_member_info' ||
    type === 'all_stage_member_info' ||
    whitelistMerkleTreeQueryType === 'has_member'

  const stageIdVisible =
    type === 'stage_member_info' || type === 'members' || type === 'stage' || whitelistMerkleTreeQueryType === 'stage'

  const { data: response } = useQuery(
    [
      contractAddress,
      type,
      whitelistMerkleTreeQueryType,
      contract,
      contractWhitelistMerkleTree,
      wallet.address,
      address,
      startAfter.value,
      limit.value,
      proofHashes,
      whitelistType,
      stageId.value,
    ] as const,
    async ({ queryKey }) => {
      const [
        _contractAddress,
        _type,
        _whitelistMerkleTreeQueryType,
        _contract,
        _contractWhitelistMerkleTree,
        _wallet,
        _address,
        _startAfter,
        _limit,
        _proofHashes,
        _whitelistType,
        _stageNumber,
      ] = queryKey
      const messages = contract?.use(contractAddress)
      const whitelistMerkleTreeMessages = contractWhitelistMerkleTree?.use(contractAddress)

      const res = await resolveAddress(_address, wallet).then(async (resolvedAddress) => {
        const result =
          whitelistType === 'merkletree'
            ? await disptachWhitelistMerkleTreeQuery({
                messages: whitelistMerkleTreeMessages,
                address: resolvedAddress,
                type: whitelistMerkleTreeQueryType,
                limit: _limit,
                proofHashes: _proofHashes,
                stageId: _stageNumber - 1,
              })
            : await dispatchQuery({
                messages,
                type,
                address: resolvedAddress,
                startAfter: _startAfter || undefined,
                limit: _limit,
                stageId: _stageNumber - 1,
              })
        return result
      })
      return res
    },
    {
      placeholderData: null,
      onError: (error: any) => {
        toast.error(error.message, { style: { maxWidth: 'none' } })
      },
      enabled: Boolean(contractAddress && (contract || contractWhitelistMerkleTree)),
    },
  )

  const router = useRouter()

  useEffect(() => {
    if (contractAddress.length > 0) {
      void router.replace({ query: { contractAddress } })
    }
    if (contractAddress.length === 0) {
      void router.replace({ query: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractAddress])
  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('contractAddress')
    if (initial && initial.length > 0) contractState.onChange(initial)
  }, [])

  const exportAllMembers = async () => {
    if (wallet.isWalletDisconnected) {
      toast.error('Please connect your wallet first.', { style: { maxWidth: 'none' } })
      setExporting(false)
      return
    }
    try {
      const messages = contract?.use(contractAddress)

      setExporting(true)
      const contractInfoResponse = await (await wallet.getCosmWasmClient())
        .queryContractRaw(
          contractAddress.trim(),
          toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
        )
        .catch((e) => {
          if (e.message.includes('bech32')) throw new Error('Invalid whitelist contract address.')
          console.log(e.message)
        })
      const contractInfo = JSON.parse(new TextDecoder().decode(contractInfoResponse as Uint8Array))
      console.log('Contract Info: ', contractInfo.contract)

      if (contractInfo.contract.includes('flex')) {
        let membersResponse = (await dispatchQuery({
          messages,
          address,
          type: 'members',
          limit: 100,
          stageId: stageId.value - 1,
        })) as any
        let membersArray = [...membersResponse.members]
        let lastMember = membersResponse.members[membersResponse.members.length - 1]

        while (membersResponse.members.length === 100) {
          membersResponse = (await dispatchQuery({
            messages,
            address,
            type: 'members',
            limit: 100,
            startAfter: lastMember.address,
            stageId: stageId.value - 1,
          })) as any
          lastMember = membersResponse.members[membersResponse.members.length - 1]
          membersArray = [...membersArray, ...membersResponse.members]
        }

        membersArray.unshift({ address: 'address', mint_count: 'mint_count' })
        const csv = membersArray.map((row) => Object.values(row).join(',')).join('\n')
        const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const csvURL = window.URL.createObjectURL(csvData)
        const tempLink = document.createElement('a')
        tempLink.href = csvURL
        tempLink.setAttribute('download', 'whitelist_flex_members.csv')
        tempLink.click()
      } else if (contractInfo.contract.includes('whitelist') && !contractInfo.contract.includes('flex')) {
        let membersResponse = (await dispatchQuery({
          messages,
          address,
          type: 'members',
          limit: 100,
          stageId: stageId.value - 1,
        })) as any
        let membersArray = [...membersResponse.members]
        let lastMember = membersResponse.members[membersResponse.members.length - 1]

        while (membersResponse.members.length === 100) {
          membersResponse = (await dispatchQuery({
            messages,
            address,
            type: 'members',
            limit: 100,
            startAfter: lastMember,
            stageId: stageId.value - 1,
          })) as any
          lastMember = membersResponse.members[membersResponse.members.length - 1]
          membersArray = [...membersArray, ...membersResponse.members]
        }

        const txt = membersArray.map((member) => member).join('\n')
        const txtData = new Blob([txt], { type: 'text/txt;charset=utf-8;' })
        const txtURL = window.URL.createObjectURL(txtData)
        const tempLink = document.createElement('a')
        tempLink.href = txtURL
        tempLink.setAttribute('download', 'whitelist_members.txt')
        tempLink.click()
      } else {
        toast.error('Invalid whitelist contract address.', { style: { maxWidth: 'none' } })
      }
      setExporting(false)
    } catch (e: any) {
      console.log(e)
      toast.error(e.message, { style: { maxWidth: 'none' } })
      setExporting(false)
    }
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Query Whitelist Contract" />
      <ContractPageHeader
        description="Whitelist contract manages the whitelisted addresses for the collection."
        link={links.Documentation}
        title="Whitelist Contract"
      />
      <LinkTabs activeIndex={1} data={whitelistLinkTabs} />

      <div className="grid grid-cols-2 p-4 space-x-8">
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <FormControl htmlId="contract-query-type" subtitle="Type of query to be dispatched" title="Query Type">
            <select
              className={clsx(
                'bg-white/10 rounded border-2 border-white/20 form-select',
                'placeholder:text-white/50',
                'focus:ring focus:ring-plumbus-20',
              )}
              defaultValue="config"
              id="contract-query-type"
              name="query-type"
              onChange={(e) =>
                whitelistType === 'merkletree'
                  ? setWhitelistMerkleTreeQueryType(e.target.value as WhitelistMerkleTreeQueryType)
                  : setType(e.target.value as QueryType)
              }
            >
              {(whitelistType === 'merkletree' ? WHITELIST_MERKLE_TREE_QUERY_LIST : QUERY_LIST).map(({ id, name }) => (
                <option key={`query-${id}`} className="mt-2 text-lg bg-[#1A1A1A]" value={id}>
                  {name}
                </option>
              ))}
            </select>
          </FormControl>
          <Conditional test={stageIdVisible}>
            <NumberInput className="w-1/4" {...stageId} />
          </Conditional>
          <Conditional test={addressVisible}>
            <AddressInput {...addressState} />
          </Conditional>
          <Conditional test={type === 'members'}>
            <TextInput {...startAfter} />
            <NumberInput {...limit} />
            <Button
              className="py-2 px-4 font-bold text-white/90 bg-stargaze hover:bg-stargaze-80 rounded"
              isLoading={exporting}
              onClick={exportAllMembers}
              type="button"
            >
              Export All Members
            </Button>
          </Conditional>
        </div>
        <JsonPreview
          content={
            contractAddress
              ? whitelistType === 'merkletree'
                ? { type: whitelistMerkleTreeQueryType, response }
                : { type, response }
              : null
          }
          noHeightLimit
          title="Query Response"
        />
      </div>
    </section>
  )
}

export default withMetadata(WhitelistQueryPage, { center: false })
