import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class VisualSettings extends DataViewObjectsParser {
    dataLabels: dataLabelsSettings;
    dataPoint: dataPointSettings;
}
export declare class dataLabelsSettings {
    show: boolean;
    fontSize: number;
    fontColor: string;
    cracyLabels: boolean;
}
export declare class dataPointSettings {
    defaultColor: string;
    showAllDataPoints: boolean;
    fill: string;
    fillRule: string;
    fontSize: number;
}
