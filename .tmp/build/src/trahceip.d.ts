import powerbiVisualsApi from "powerbi-visuals-api";
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
export interface ItrahcEipDataTooltip {
    measureName: string;
    measureValue: string;
    measureFormat: string;
}
export interface ItrahcEipData {
    category: string;
    value: number;
    valueFormat: string;
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
    order: number;
    tooltips: ItrahcEipDataTooltip[];
}
import VisualTooltipDataItem = powerbiVisualsApi.extensibility.VisualTooltipDataItem;
export declare class ItrahcEipDataTooltip {
    static getTooltipData(value: any): VisualTooltipDataItem[];
}
