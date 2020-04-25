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
    arcPercPositive: number;
    segmentValueNegative: number;
    segmentPercNegative: number;
    arcValueNegative: number;
    arcPercNegative: number;
}
import VisualTooltipDataItem = powerbiVisualsApi.extensibility.VisualTooltipDataItem;
export declare class ItrahcEipDataTooltip {
    static getTooltipData(value: any): VisualTooltipDataItem[];
}
