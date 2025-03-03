import { SelectionType } from '../types';
export declare const useSelections: () => {
    selections: Record<string, SelectionType[]>;
    setSelections: import("react").Dispatch<import("react").SetStateAction<Record<string, SelectionType[]>>>;
    addSelection: (selection: SelectionType, identifier: string) => Promise<void>;
    updateSelection: (id: string, updatedSelection: SelectionType, identifier: string) => Promise<void>;
    removeSelection: (selection: SelectionType, identifier: string) => void;
};
