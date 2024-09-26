import React, { MouseEventHandler } from 'react';
import { SelectionType, PopoverChildrentype } from '../../types';
type BaseHighlighterProps = {
    htmlString: string;
    minSelectionLength?: number;
    maxSelectionLength?: number;
    className?: string;
    selectionWrapperClassName?: string;
    PopoverClassName?: string;
    PopoverChildren?: PopoverChildrentype;
    disablePopover?: boolean;
    disableMultiColorHighlight?: boolean;
    onClickHighlight?: (selection: SelectionType, event: MouseEvent) => void;
    onClick?: MouseEventHandler<HTMLDivElement>;
    onSelection?: (selection: SelectionType) => void;
    onCopy?: (selection: SelectionType) => void;
};
export declare const Highlighter: React.FC<BaseHighlighterProps>;
export {};
