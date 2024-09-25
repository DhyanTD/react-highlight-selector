import { SelectionType } from '../types';
export declare const useSelections: () => {
    selections: SelectionType[];
    setSelections: import("react").Dispatch<import("react").SetStateAction<SelectionType[]>>;
    addSelection: (selection: SelectionType) => Promise<void>;
    updateSelection: (id: string, updatedSelection: SelectionType) => Promise<void>;
    removeSelection: (selection: SelectionType) => void;
};
