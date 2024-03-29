import type { ExecuteListItem } from 'contracts/openEditionMinter/messages/execute'
import { useState } from 'react'

export const useExecuteComboboxState = () => {
  const [value, setValue] = useState<ExecuteListItem | null>(null)
  return { value, onChange: (item: ExecuteListItem) => setValue(item) }
}
