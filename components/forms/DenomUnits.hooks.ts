import { useMemo, useState } from 'react'
import { uid } from 'utils/random'

import type { DenomUnit } from './DenomUnits'

export function useDenomUnitsState() {
  const [record, setRecord] = useState<Record<string, DenomUnit>>(() => ({}))

  const entries = useMemo(() => Object.entries(record), [record])
  const values = useMemo(() => Object.values(record), [record])

  function add(attribute: DenomUnit = { denom: '', exponent: 0, aliases: '' }) {
    setRecord((prev) => ({ ...prev, [uid()]: attribute }))
  }

  function update(key: string, attribute = record[key]) {
    setRecord((prev) => ({ ...prev, [key]: attribute }))
  }

  function remove(key: string) {
    return setRecord((prev) => {
      const latest = { ...prev }
      delete latest[key]
      return latest
    })
  }

  function reset() {
    setRecord({})
  }

  return { entries, values, add, update, remove, reset }
}
