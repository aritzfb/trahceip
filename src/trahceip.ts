import powerbiVisualsApi from "powerbi-visuals-api";
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
export interface ItrahcEipData {
    category: string;
    value: number;
    color: string;
    totalSegments: number;
    totalArcs: number;
    isPositive: boolean;
    sumIsPositive : boolean;
    negativeValue: number;
    negativeCategory: string;
    negativeColor : string;
    selectionId : ISelectionId;

    //when the total is positive
    segmentValuePositive :number;
    segmentPercPositive:number;
    arcValuePositive:number;
    arcPercPositive:number;

    //when the total is negative
    segmentValueNegative :number;
    segmentPercNegative:number;
    arcValueNegative:number;
    arcPercNegative:number;
    

}
import VisualTooltipDataItem = powerbiVisualsApi.extensibility.VisualTooltipDataItem;
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
export class ItrahcEipDataTooltip {
    public static getTooltipData(value: any): VisualTooltipDataItem[] {
        //let language = getLocalizedString(this.locale, "LanguageKey");
        //_this.options.host.locale;
        //let percentFormat = valueFormatter.create({ format: "0.00 %;-0.00 %;0.00 %" , cultureSelector:this.myhost.locale});
        let percentFormat = valueFormatter.create({ format: "0.00 %;-0.00 %;0.00 %" });
        let numberFormat = valueFormatter.create({ format: "#,0.00" });
        //let numberFormat = valueFormatter.create({ format: "#,0.00" , cultureSelector:this.myhost.locale});
        var myValue = value.value;
        var myCategory = value.data.category;
        //var absolute = Math.abs(value.value*value.data.totalSegments/value.data.totalArcs).toFixed(2)+"%";
        var extra={};
        var retorno = [];
        if (value.data.sumIsPositive){
            //if (value.data.negativeValue<0) {
            if (!value.data.isPositive) {
                //for negatives segments
                //var arcValue = value.data.negativeValue*(value.value/value.data.totalSegments);
                //var arcValuePerc = Math.abs(arcValue/value.data.totalSegments);
                extra = {
                    displayName: "Residual value: ",
                    //value: "Value: " + numberFormat.format(arcValue) + " (" + percentFormat.format(arcValuePerc) + " of total pie)",
                    value: "Value: " + numberFormat.format(value.data.arcValuePositive) + " (" + percentFormat.format(value.data.arcPercPositive) + " of total pie)",
                    color:"black"
                }
                retorno.push(extra);
                extra = {
                    displayName: "Category: " + value.data.negativeCategory,
                    value: "Value: " + numberFormat.format(value.data.negativeValue) + " (" + percentFormat.format(Math.abs(value.data.negativeValue/value.data.totalArcs)) + " of negatives values)",
                    color: value.data.negativeColor
                }
                retorno.push(extra);
    
                
            } else {
                //for positive arcs
                //var segmentValue = Math.abs(myValue*value.data.totalArcs/value.data.totalSegments);
                //var segmentValuePerc = segmentValue/value.data.totalSegments;
                //var segmenValuePerc
                
                extra = {
                    displayName: "Residual value:",
                    //value: "Value: " + numberFormat.format(segmentValue) + " (" + percentFormat.format(segmentValuePerc) + " of total pie)",
                    value: "Value: " + numberFormat.format(value.data.segmentValuePositive) + " (" + percentFormat.format(value.data.segmentPercPositive) + " of total pie)",
                    color:"white"
                }
                retorno.push(extra);
                
                retorno.push({
                    displayName: "Category: " + myCategory,
                    value: "Value: " + numberFormat.format(myValue) + " (" + percentFormat.format(myValue/value.data.totalSegments) + " of positives values)",
                    //total: value.data.totalSegments.value.toString(),
                    //total: "Total: " + numberFormat.format(segmentValue) + " (" + percentFormat.format(segmentValuePerc) + " of total pie)",
                    color: value.data.color
                    //, header:"cabecera"
                    //,header: language && "displayed language " + language
                });
            }
        } else {
            //sum is negative
            if (!value.data.isPositive) {
                //for positive segments
                var myvalue = Math.abs(value.data.negativeValue)
                var arcValue = Math.abs(myvalue*(value.value/value.data.totalArcs));
                var arcValuePerc = Math.abs(arcValue/value.data.totalArcs);
                extra = {
                    displayName: "Residual value: ",
                    //value: "Value: " + numberFormat.format(arcValue) + " (" + percentFormat.format(arcValuePerc) + " of total pie)",
                    value: "Value: " + numberFormat.format(value.data.arcValueNegative) + " (" + percentFormat.format(value.data.arcPercNegative) + " of total pie)",
                    color:"black"
                }
                retorno.push(extra);
                extra = {
                    displayName: "Category: " + value.data.negativeCategory,
                    value: "Value: " + numberFormat.format(myvalue) + " (" + percentFormat.format(Math.abs(value.data.negativeValue/value.data.totalSegments)) + " of positives values)",
                    color: value.data.negativeColor
                }
                retorno.push(extra);
    
                
            } else {
                //for negative arcs
                //var segmentValue = Math.abs(myValue*value.data.totalSegments/value.data.totalArcs);
                //var segmentValuePerc = Math.abs(segmentValue/value.data.totalArcs);
                extra = {
                    displayName: "Residual value:",
                    //value: "Value: " + numberFormat.format(-1*segmentValue) + " (" + percentFormat.format(segmentValuePerc) + " of total pie)",
                    value: "Value: " + numberFormat.format(value.data.segmentValueNegative) + " (" + percentFormat.format(value.data.segmentPercNegative) + " of total pie)",
                    color:"white"
                }
                retorno.push(extra);
    
                retorno.push({
                    displayName: "Category: " + myCategory,
                    value: "Value: " + numberFormat.format(-1*myValue) + " (" + percentFormat.format(Math.abs(myValue/value.data.totalArcs)) + " of negatives values)",
                    //total: value.data.totalSegments.value.toString(),
                    color: value.data.color
                    //,header: language && "displayed language " + language
                });
            }
            
        }
        return retorno;
    }
}

