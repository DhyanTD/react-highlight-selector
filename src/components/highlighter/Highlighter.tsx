import React, { useRef, MouseEventHandler, useCallback, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { deserializeRange, serializeRange } from '../../libs/serialize'
import { generateId } from '../../libs/uid'
import { getPopoverElement, getSpanElement } from '../../libs/wrapperElements'
import DefaultPopover from '../DeafultPopover'
import { useSelections } from '../../hooks/UseSelection'
import { SelectionType, PopoverChildrentype } from '../../types'
import { defaultMinSelectionLength, defaultSelectionWrapperClassName } from '../../constants/constants'
import { addHighlight, isHighlightable } from '../../libs/dom'
import { getOriginalRange, getRangeStartEndContainerText } from '../../libs/createRange'
import { sortByPositionAndOffset } from '../../libs/sort'

type BaseHighlighterProps = {
  htmlString: string
  minSelectionLength?: number
  maxSelectionLength?: number
  className?: string
  selectionWrapperClassName?: string
  PopoverClassName?: string
  PopoverChildren?: PopoverChildrentype
  disablePopover?: boolean
  disableMultiColorHighlight?: boolean
  identifier: string

  onClickHighlight?: (selection: SelectionType, event: MouseEvent) => void
  onClick?: MouseEventHandler<HTMLDivElement>
  onSelection?: (selection: SelectionType) => void
  onCopy?: (selection: SelectionType) => void
}

const extractHighlightsFromHtml = (
  htmlString: string,
  identifier: string,
): { cleanedHtml: string; initialSelections: Record<string, SelectionType[]> } => {
  const preprocessedHtml = htmlString
    .replace(/<div([^>]*)(\sid="selection-[^"]+")([^>]*)>/gi, '<span$1$2$3>')
    .replace(/<\/div>/gi, '</span>')

  const parser = new DOMParser()
  const doc = parser.parseFromString(preprocessedHtml, 'text/html')
  const initialSelections: Record<string, SelectionType[]> = {}

  const highlightElements = doc.querySelectorAll('span[id^="selection-"]')

      const data: SelectionType[] = []
  highlightElements.forEach((el) => {
    const id = el.getAttribute('id') || `selection-${generateId()}`
    const className = el.className || defaultSelectionWrapperClassName
    const text = el.textContent || ''
    const parent = el.parentElement

    if (parent && text) {
      const prevSibling = el.previousSibling
      const nextSibling = el.nextSibling
      let leadingSpace = ''
      let trailingSpace = ''

      if (prevSibling?.nodeType === Node.TEXT_NODE) {
        leadingSpace = prevSibling.textContent?.match(/\s+$/)?.pop() || ''
        prevSibling.textContent = prevSibling.textContent?.replace(/\s+$/, '') || ''
      }

      if (nextSibling?.nodeType === Node.TEXT_NODE) {
        trailingSpace = nextSibling.textContent?.match(/^\s+/)?.pop() || ''
        nextSibling.textContent = nextSibling.textContent?.replace(/^\s+/, '') || ''
      }

      const textNode = doc.createTextNode(`${leadingSpace}${text}${trailingSpace}`)
      parent.replaceChild(textNode, el)

      const range = doc.createRange()
      range.selectNodeContents(textNode)
      // const meta = serializeRange(range, parent);
      const meta = el.getAttribute('data-meta') || serializeRange(range, parent)
      data.push({
        id,
        text,
        className,
        meta,
        startContainerText: text,
        endContainerText: text,
      })
    }
  })
  initialSelections[identifier] = data
  const cleanedHtml = doc.body.innerHTML.trim()
  // const cleanedHtml =  `<div>` +doc.body.innerHTML.trim() + `</div>`;
  console.log(doc.body.innerHTML, 'doc.body.innerHTML cleanedHtml', identifier, initialSelections)
  // const cleanedHtml = `<div><p>hhhhh</p><p>question 101</p> question</div>`

  return { cleanedHtml, initialSelections }
}

export const Highlighter: React.FC<BaseHighlighterProps> = ({
  htmlString,
  onClickHighlight,
  disablePopover,
  maxSelectionLength,
  minSelectionLength,
  className,
  PopoverChildren,
  PopoverClassName,
  selectionWrapperClassName,
  onSelection,
  onClick,
  onCopy,
  disableMultiColorHighlight,
  identifier,
  // selections,
}) => {
  console.log(htmlString, 'removal string cleandHtml')
  const { cleanedHtml, initialSelections } = useMemo(
    () => extractHighlightsFromHtml(htmlString, identifier),
    [htmlString],
  )
  const { selections, setSelections, addSelection, removeSelection, updateSelection } = useSelections()
  // const rootRef = useRef<HTMLDivElement | null>(null)
  // const tempRef = useRef<HTMLDivElement | null>(null)
  // const div = document.createElement('div')
  // tempRef.current = div
  // tempRef.current.innerHTML = htmlString
  useEffect(() => {
    console.log('cleanedHtml comming here0', initialSelections, selections, cleanedHtml)
    if (
      (!selections[identifier] || selections[identifier]?.length === 0) &&
      initialSelections[identifier]?.length > 0
    ) {
      console.log('cleanedHtml comming here1', initialSelections)
      setSelections(initialSelections)
    }
  }, [initialSelections])

  const rootRef = useRef<HTMLDivElement | null>(null)
  const tempRef = useRef<HTMLDivElement | null>(null)
  const div = document.createElement('div')
  tempRef.current = div
  tempRef.current.innerHTML = cleanedHtml

  console.log(cleanedHtml, 'cleanedHtml', selections, 'initialSelections', initialSelections)

  const handleHoverAndClickEffects = () => {
    if (!rootRef.current) return
    rootRef.current.querySelectorAll('.hover-content-mark').forEach((mark) => {
      const uniqueId = mark.getAttribute('data-hover-id')
      const shortHtml = mark.getAttribute('data-short-html')
      const longHtml = mark.getAttribute('data-long-html')
      if (!uniqueId || (!shortHtml && !longHtml)) return

      const markElement = mark as HTMLElement
      if (shortHtml && shortHtml.trim() !== '') {
        const popup = document.createElement('div')
        popup.className = 'hover-content-popup'
        popup.innerHTML = shortHtml + (longHtml ? `<button class="view-more">View More</button>` : '')
        markElement.appendChild(popup)

        let timeout: any

        const showPopup = () => {
          clearTimeout(timeout)

          popup.style.display = 'block'
        }

        const hidePopup = () => {
          timeout = setTimeout(() => {
            popup.style.display = 'none'
          }, 100)
        }

        markElement.addEventListener('mouseenter', showPopup)
        markElement.addEventListener('mouseleave', hidePopup)
        popup.addEventListener('mouseenter', showPopup)
        popup.addEventListener('mouseleave', hidePopup)
        popup.querySelector('.view-more')?.addEventListener('click', () => {
          const modal = document.createElement('div')
          modal.className = 'modal'
          modal.innerHTML = `
            <div class="modal-content">
              <button class="close-button">close</button>
              ${longHtml}
            </div>
          `

          document.body.appendChild(modal)
          modal.querySelector('.close-button')?.addEventListener('click', () => {
            document.body.removeChild(modal)
          })
        })
      } else {
        markElement.addEventListener('click', (event) => {
          event.preventDefault()
          const modal = document.createElement('div')
          modal.className = 'modal'
          modal.innerHTML = `
            <div class="modal-content">
              <button class="close-button">close</button>
              ${longHtml}
            </div>
          `
          document.body.appendChild(modal)

          modal.querySelector('.close-button')?.addEventListener('click', () => {
            document.body.removeChild(modal)
          })
        })
      }
    })
  }

  const getWrapper = useCallback(
    (selection: SelectionType) => {
      const span = getSpanElement({
        className: selection?.className || defaultSelectionWrapperClassName,
        meta: selection?.meta || '',
      })
      if (!disablePopover) {
        const popover = getPopoverElement({ className: PopoverClassName })
        if (!PopoverClassName) {
          span.onmouseover = () => {
            popover.style.visibility = 'visible'
            popover.style.opacity = '1'
          }
          span.onmouseout = () => {
            popover.style.visibility = 'hidden'
            popover.style.opacity = '0'
          }
        }
        popover.id = `pop-${selection.id}`
        span.appendChild(popover)
      }

      if (onClickHighlight) {
        span.onclick = (e) => onClickHighlight(selection, e)
      }
      span.id = selection.id

      return span
    },
    [PopoverClassName, disablePopover, onClickHighlight],
  )

  const handleMouseUp: MouseEventHandler<HTMLDivElement> = () => {
    // e.stopPropagation()
    const selection = window.getSelection()

    if (!selection) return
    if (!minSelectionLength) {
      minSelectionLength = defaultMinSelectionLength
    }
    if (minSelectionLength && selection?.toString().length < minSelectionLength) return
    if (maxSelectionLength && selection?.toString().length > maxSelectionLength) return
    const range = selection.getRangeAt(0)
    if (!isHighlightable(range)) return
    const expRange = getOriginalRange(range, tempRef.current!)
    if (!expRange) return
    const { startContainerText, endContainerText } = getRangeStartEndContainerText(range)
    const newSelection: SelectionType = {
      meta: serializeRange(expRange, tempRef.current!),
      text: range?.toString(),
      id: `selection-${generateId()}`,
      className: selectionWrapperClassName || defaultSelectionWrapperClassName,
      startContainerText,
      endContainerText,
    }

    addSelection(newSelection, identifier)
    onSelection && onSelection(newSelection)

    console.log('cleanedHtml selection --?/p', selections)
  }
  function manageCopy(selection: SelectionType) {
    // const span = getSpanElement({
    //   className: selection.className || defaultSelectionWrapperClassName,
    // })
    onCopy && onCopy(selection)
  }
  useEffect(() => {
    const sortedSelections = sortByPositionAndOffset(selections[identifier])
    if (!rootRef.current) return
    rootRef.current.innerHTML = ''
    // rootRef.current.innerHTML = htmlString
    rootRef.current.innerHTML = cleanedHtml

    handleHoverAndClickEffects()

    if (sortedSelections && sortedSelections?.length) {
      for (let i = 0; i < sortedSelections.length; i++) {
        const item = sortedSelections[i] as SelectionType
        const range = deserializeRange(item.meta, rootRef.current!)
        if (range) {
          addHighlight(range, getWrapper(item))
          // onHiglightChange && onHiglightChange('')
        }
        const popoverRoot = document.getElementById(`pop-${item.id}`)
        if (!popoverRoot) return
        const root = ReactDOM.createRoot(popoverRoot)

        if (PopoverChildren) {
          root.render(
            <PopoverChildren
              selection={item}
              removeSelection={removeSelection}
              updateSelection={updateSelection}
              handleCopy={(selection) => manageCopy(selection[identifier])}
              disableMultiColorHighlight={disableMultiColorHighlight}
              identifier={identifier}
            />,
          )
        } else {
          root.render(
            <DefaultPopover
              removeSelection={removeSelection}
              selection={item}
              updateSelection={updateSelection}
              handleCopy={(selection) => manageCopy(selection[identifier])}
              disableMultiColorHighlight={disableMultiColorHighlight}
              identifier={identifier}
            />,
          )
        }
      }
    }
  }, [
    selections,
    getWrapper,
    PopoverChildren,
    // htmlString,
    cleanedHtml,
    removeSelection,
    updateSelection,
    disableMultiColorHighlight,
    identifier,
  ])

  const memoizedChildren = useMemo(() => {
    return (
      <div
        ref={rootRef}
        id={identifier ? `highlighter-root` + identifier : `highlighter-root`}
        onClick={onClick}
        onMouseUp={handleMouseUp}
        className={className}
      />
    )
  }, [onClick, handleMouseUp, className, identifier])

  return memoizedChildren
}
