export const getSpanElement = ({ className }: { className?: string }) => {
  const span = document.createElement('div')
  if (className) {
    span.className = className
  }
  return span
}
export const getPopoverElement = ({ className }: { className?: string }) => {
  const popover = document.createElement('div')

  if (!className) {
    popover.setAttribute(
      'style',
      ` visibility: hidden;
        min-width:  20px;
        background-color: transparent;
        text-align: center;
        position: absolute;
        z-index:  1;
        bottom:  100%;
        padding-bottom:16px;
        opacity:  0;
        display: inline-block; 
        transition: opacity  0.3s;`,
    )
    return popover
  }

  popover.className = className
  return popover
}
