export type SelectionType = {
  meta: string
  text: string
  startContainerText?: string
  endContainerText?: string
  id: string
  className?: string
  [Key: string]: any
}
export type PopoverChildrentype = React.FC<{
  handleCopy?: (selection: SelectionType) => void
  selection: SelectionType
  removeSelection: (slection: SelectionType) => void
  updateSelection: (id: string, updatedSelection: SelectionType) => void
  disableMultiColorHighlight?: boolean
}>

export type XpathType = {
  start: string
  end: string
  startOffset: number
  endOffset: number
}
