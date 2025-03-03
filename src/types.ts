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
  handleCopy?: (selection: SelectionType, identifier:string) => void
  selection: Record<string, SelectionType>
  removeSelection: (slection: SelectionType, identifier:string) => void
  updateSelection: (id: string, updatedSelection: SelectionType, identifier: string) => void
  disableMultiColorHighlight?: boolean,
  identifier: string
}>

export type XpathType = {
  start: string
  end: string
  startOffset: number
  endOffset: number
}
