import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import "./../style/visual.less";
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
}
export declare class Visual implements IVisual {
    private target;
    private svg;
    private colorPalette;
    private visualSettings;
    private selectionManager;
    private tooltipServiceWrapper;
    private selectionId;
    private myhost;
    private element;
    private isLandingPageOn;
    private LandingPageRemoved;
    private LandingPage;
    private createSampleLandingPage;
    private HandleLandingPage;
    constructor(options: VisualConstructorOptions);
    private getTooltipData;
    update(options: VisualUpdateOptions): void;
    private static parseSettings;
    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject;
}
