import powerbiVisualsApi from "powerbi-visuals-api";
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
export interface ItrahcEipData {
    category: string;
    value: number;
    color: string;
    totalSegments: number;
    totalArcs: number;
    isPositive: boolean;
    sumIsPositive: boolean;
    negativeValue: number;
    negativeCategory: string;
    negativeColor: string;
    selectionId: ISelectionId;
    segmentValuePositive: number;
    segmentPercPositive: number;
    arcValuePositive: number;
}
import VisualTooltipDataItem = powerbiVisualsApi.extensibility.VisualTooltipDataItem;
export declare class ItrahcEipDataTooltip {
    static getTooltipData(value: any): VisualTooltipDataItem[];
}
