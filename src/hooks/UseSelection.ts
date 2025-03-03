import { useContext } from 'react'
import { SelectionsContext } from '../providers/SelectionProvider'
import { SelectionType } from '../types'

export const useSelections = () => {
  const selectionContext = useContext(SelectionsContext)
  if (!selectionContext) {
    throw new Error('useSelection hook must be used inside selectionProvider')
  }
  const { selections, setSelections } = selectionContext

  const addSelection = async (selection: SelectionType, identifier: string) => {
    setSelections((prev) => {
      const idInPrev = prev[identifier] ?? []
      const index = idInPrev?.findIndex((item) => item.id === selection.id)
      console.log(idInPrev, "cleanedHtml---------------", index);
      if (index === -1) {
        return { ...prev, [identifier]: [...idInPrev, selection] }
      }
      return prev
    })
    console.log(selection,"cleanedHtml---------------", identifier)
  }

  // const addSelection = async (selection: SelectionType) => {
  //   setSelections((prev) => {
  //     const index = prev.findIndex((item) => item.id === selection.id)
  //     if (index === -1) {
  //       return [...prev, selection]
  //     }

  //     return prev
  //   })
  // }
  // const updateSelection = async (id: string, updatedSelection: SelectionType) => {
  //   setSelections((prev) => {
  //     const index = prev.findIndex((item) => item.id === id)

  //     if (index !== -1) {
  //       prev.splice(index, 1)
  //     }
  //     return [...prev, updatedSelection]
  //   })
  // }

  const updateSelection = async (id: string, updatedSelection: SelectionType, identifier: string) => {
    setSelections((prev) => {
      const idInPrev = prev[identifier] ?? []
      const index = idInPrev?.findIndex((item) => item.id === id)

      if (index !== -1) {
        idInPrev.splice(index, 1)
      }
      return { ...prev, [identifier]: [...idInPrev, updatedSelection] }
    })
  }
  // const removeSelection = (selection: SelectionType) => {
  //   console.log('Removing selection:', selection.id, selection);
  //   setSelections((prev) => {
  //     const newSelections = prev.filter((item) => item.id !== selection.id);
  //     console.log('New selections after removal:', newSelections);
  //     return newSelections;
  //   });
  // }

  const removeSelection = (selection: SelectionType, identifier: string) => {
    console.log('Removing selection:', selection.id, selection);
    setSelections((prev) => {
      const idInPrev = prev[identifier] ?? []
      const newSelections = idInPrev?.filter((item) => item.id !== selection.id);
      console.log('New selections after removal:', newSelections);
      return { ...prev, [identifier]: newSelections };
    });
  }

  console.log(selections, "removal selection selection")

  return {
    selections,
    setSelections,
    addSelection,
    updateSelection,
    removeSelection,
  }
}
