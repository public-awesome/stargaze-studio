import { useState } from 'react'

import type { ActionListItem } from './actions'

export const useActionsComboboxState = () => {
  const [value, setValue] = useState<ActionListItem | null>(null)
  return { value, onChange: (item: ActionListItem) => setValue(item) }
}
