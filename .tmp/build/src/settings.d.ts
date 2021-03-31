import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class VisualSettings extends DataViewObjectsParser {
    dataLabels: dataLabelsSettings;
    dataColors: dataColorsSettings;
}
export declare class dataLabelsSettings {
    show: boolean;
    fontSize: number;
    fontColor: string;
    cracyLabels: boolean;
}
export declare class dataColorsSettings {
    transparency: number;
}
