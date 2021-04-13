/*
*  Power BI Visual LI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import PrimitiveValue = powerbi.PrimitiveValue; 
import IVisualHost = powerbi.extensibility.visual.IVisualHost; 
import IColorPalette = powerbi.extensibility.IColorPalette; 
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration; 
import Fill = powerbi.Fill; 
//import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem; 
import ISelectionManager = powerbi.extensibility.ISelectionManager; 
//import ISelectionId = powerbi.extensibility.ISelectionId;
//import ITooltipServiceWrapper = powerbi.extensibility.ITooltipService;
//import ITooltipService = powerbi.extensibility.VisualTooltipDataItem;
//import TooltipEventArgs = powerbi.extensibility.IVisualEventService;
//import TooltipEventArgs = powerbi.extensibility.TooltipShowOptions;

import * as d3 from "d3";
import "./../style/visual.less";
import {
    Selection,
    event as d3Event,
    select as d3Select,
    touches as d3Touches,
    ContainerElement
} from "d3-selection";
import { createTooltipServiceWrapper, TooltipEventArgs, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";



import { VisualSettings } from "./settings";

import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import { ItrahcEipData }  from "./trahceip"
import {ItrahcEipDataTooltip} from "./trahceip"

import ISelectionId = powerbi.visuals.ISelectionId;
import { format } from "powerbi-visuals-utils-formattingutils/lib/src/valueFormatter";
/*
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

}
*/
const DefaultHandleTouchDelay = 1000;

//const getEvent = () => require("d3-selection").event; //d3Event
//const getEvent = () => d3Event.event; //d3Event

export class Visual implements IVisual {
    
    private target: HTMLElement;
    private svg: d3.Selection<any, any, any, any>; 
    private colorPalette:IColorPalette; 
    private visualSettings: VisualSettings;
    private selectionManager : ISelectionManager;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    //private myITooltipService : ITooltipService;
    private selectionId : ISelectionId;
    private myhost : IVisualHost;


    private element: HTMLElement;
    private isLandingPageOn: boolean;
    private LandingPageRemoved: boolean;
    private LandingPage: d3.Selection<any,any,any,any>;

    private  createSampleLandingPage () : Element {
        let miNodo : HTMLDivElement;
        
        miNodo = document.createElement("div");
        let titulo : HTMLParagraphElement = document.createElement("p");
        titulo.textContent = "Landing page test. Special thanks to Sergio Alvaro Panizo.";
        miNodo.appendChild(titulo);
        miNodo.id="midividlandingpage";
            
        
        return miNodo;
    } 

    private HandleLandingPage(options: VisualUpdateOptions) {
        if(!options || !options.dataViews || !options.dataViews.length) {
            if(!this.isLandingPageOn) {
                this.isLandingPageOn = true;
                const SampleLandingPage: Element = this.createSampleLandingPage(); //create a landing page
                this.element.appendChild(SampleLandingPage);
                this.LandingPage = d3.select(SampleLandingPage);
                
                //add again landing page?
                //this.LandingPageRemoved = false;
                
            }
 
        } else {
                if(this.isLandingPageOn && !this.LandingPageRemoved){
                    this.LandingPageRemoved = true;                    
                    this.LandingPage.remove();

                    //add again landing page?
                    //this.isLandingPageOn = false;
                }
            
        }
    }


    private handleContextMenu() {
        this.svg.on('contextmenu', () => {
            debugger;
            this.tooltipServiceWrapper.hide();
            //const mouseEvent: MouseEvent = getEvent();
            const mouseEvent: MouseEvent = d3Event;
            const eventTarget: EventTarget = mouseEvent.target;
            //let dataPoint: any = d3Select(<d3.BaseType>eventTarget).datum();
            let dataPoint: any = d3Select(<d3.BaseType>eventTarget).datum();
            this.selectionManager.showContextMenu(dataPoint ? dataPoint.data.selectionId : {}, {
                x: mouseEvent.clientX,
                y: mouseEvent.clientY
            });
            mouseEvent.preventDefault();
        });
    }

    constructor(options: VisualConstructorOptions) {
        this.myhost = options.host;
        console.log('Visual constructor', options);
        this.colorPalette = options.host.colorPalette;
        this.selectionManager = options.host.createSelectionManager();
        this.element = options.element;
        this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
       //this.tooltipServiceWrapper = createTooltipServiceWrapper()
        
        //this.myITooltipService = createTooltipService(options.host.tooltipService, options.element);
        this.HandleLandingPage(null);
        this.svg = d3
                .select(options.element)
                .append('svg')
                .classed('pieChart', true);
        this.handleContextMenu();

    }
    
    

    public update(options: VisualUpdateOptions) {
        
        //this.selectionId = this.myhost.createSelectionIdBuilder().withCategory("a",1).createSelectionId();   
        let dataView: DataView = options.dataViews[0];
        debugger;
        this.visualSettings = VisualSettings.parse<VisualSettings>(dataView);
        
        
        
        console.log('Visual update', options);
  
        /** Clear the svg content, as it'll keep overwriting on every update otherwise */
        console.log('Removing elements...');
        this.svg.selectAll('*').remove();   
        //this.tooltipServiceWrapper.hide();


        /** Resolve dimensions based on viewport */
        console.log('Resolving dimensions...');
        let width = options.viewport.width,
            height = options.viewport.height,
            radius = Math.min(width, height) / 2;
      
        /** Apply width & height to main element, then add the group (g) element for the pie */
        console.log('Setting and appending SVG elements...');
        this.svg
            .attr('width', width)
            .attr('height', height);
        
        let container = this.svg
            .append('g')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        
            

        /** We'll now assign the category/value/colour into this interface. Note that the data variable
         *  is specified as an array of our IData interface from above.
         */
        console.log('Assigning data...');
        let data: ItrahcEipData[] = [];
        let dataneg: ItrahcEipData[] = [];
        
        let totalvalpos : number = 0;
        let totalvalneg : number = 0;
        for(var i = 0;i<options.dataViews[0].categorical.categories[0].values.length;i++){
            if (options.dataViews[0].categorical.values[0].values[i].valueOf()>0)
                totalvalpos += Number.parseFloat( options.dataViews[0].categorical.values[0].values[i].toString());
            else 
                totalvalneg += Number.parseFloat( options.dataViews[0].categorical.values[0].values[i].toString());
            
        }
        let sumIsPositive : boolean = true;
        if (Math.abs(totalvalneg)>totalvalpos) sumIsPositive = false;
        let posOrder : number = 1;
        let negOrder : number = 1;
        for(var i = 0;i<options.dataViews[0].categorical.categories[0].values.length;i++){
            this.selectionId = this.myhost.createSelectionIdBuilder().withCategory(options.dataViews[0].categorical.categories[0],i).createSelectionId();   
            var itemValue =  Number.parseFloat( options.dataViews[0].categorical.values[0].values[i].toString()); 
            if (!sumIsPositive) itemValue = -1*itemValue;
            //var formatValue = options.dataViews[0].metadata.columns[1].format;
            //if (options.dataViews[0].categorical.values[0].values[i].valueOf()>0) {

            //get metadata
            var metadataValues = {
                mesureFormat : ""
                , tooltipsFormat : []
            }
            for(var col = 0; col < options.dataViews[0].metadata.columns.length; col++){
                if(options.dataViews[0].metadata.columns[col].isMeasure && options.dataViews[0].metadata.columns[col].roles.measure ){
                    metadataValues.mesureFormat = options.dataViews[0].metadata.columns[col].format;
                } else if (options.dataViews[0].metadata.columns[col].isMeasure && options.dataViews[0].metadata.columns[col].roles.tooltips){
                    var tooltipformat = {
                        measureName : options.dataViews[0].metadata.columns[col].displayName
                        , measureFormat : options.dataViews[0].metadata.columns[col].format
                    }
                    metadataValues.tooltipsFormat.push(tooltipformat);
                }
            }
            
            //set tooltips info
            let mylisttooltips : ItrahcEipDataTooltip[] = [];
            for (var j= 1; j < options.dataViews[0].categorical.values.length; j++){
                
                var nombreMedida = "";
                nombreMedida = options.dataViews[0].categorical.values[j].source.displayName.toString();
                var valorMedida = null; 
                
                if (options.dataViews[0].categorical.values[j].values[i]) 
                    //valorMedida = Number.parseFloat( options.dataViews[0].categorical.values[j].values[i].toString());
                    //valorMedida = options.dataViews[0].categorical.values[j].values[i].toString();
                    valorMedida = options.dataViews[0].categorical.values[j].values[i];

                if(valorMedida != null){
                    
                    let toolItem : ItrahcEipDataTooltip = { measureName: "", measureValue: null, measureFormat: ""};
                    toolItem.measureName = nombreMedida;
                    toolItem.measureValue = valorMedida;
                    var formattool = "";
                    var col2 = 0;
                    var encontrado = false;
                    while(!encontrado && col2 < metadataValues.tooltipsFormat.length ){
                        if(nombreMedida.toString() == metadataValues.tooltipsFormat[col2].measureName.toString()){
                            formattool = metadataValues.tooltipsFormat[col2].measureFormat;
                            encontrado = true;
                        }
                        col2++;
                    }
                    
                    toolItem.measureFormat = formattool;

                    mylisttooltips.push(toolItem);
                }
                
            }
            
            if(itemValue>0){
                //this.selectionId.with
                //var segmentValue = Math.abs(myValue*value.data.totalArcs/value.data.totalSegments);

                
                
                
                var item  = {
                    category : options.dataViews[0].categorical.categories[0].values[i].toString()
                    , value : itemValue
                    , valueFormat : metadataValues.mesureFormat
                    , color : this.colorPalette.getColor(options.dataViews[0].categorical.categories[0].values[i].toString()).value
                    , totalSegments : totalvalpos
                    , totalArcs : totalvalneg
                    , isPositive : true
                    , sumIsPositive : sumIsPositive
                    , negativeValue : 0
                    , negativeCategory : ""
                    , negativeColor : ""
                    , selectionId : this.selectionId

                    //, segmentValuePositive : Math.abs(itemValue*totalvalneg/totalvalpos)
                    , segmentValuePositive : Math.abs(itemValue+itemValue/totalvalpos*totalvalneg)
                    , segmentPercPositive: Math.abs(itemValue+itemValue/totalvalpos*totalvalneg)/totalvalpos
                    , arcValuePositive : 0
                    , arcPercPositive: 0

                    //, segmentValueNegative : itemValue*totalvalpos/totalvalneg
                    //, segmentValueNegative : itemValue*totalvalpos
                    , segmentValueNegative : -1*itemValue-itemValue/totalvalneg*totalvalpos
                    //, segmentValueNegative : itemValue
                    //, segmentPercNegative : Math.abs(itemValue*totalvalpos/totalvalneg/totalvalneg)
                    , segmentPercNegative : Math.abs((-1*itemValue-itemValue/totalvalneg*totalvalpos)/totalvalneg)
                    , arcValueNegative : 0
                    , arcPercNegative : 0

                    , order : posOrder

                    , tooltips : mylisttooltips
                }
                data.push(item);
                posOrder++;
                                    
            } else {
                //var segmentValue = Math.abs(myValue*value.data.totalSegments/value.data.totalArcs);
                //var segmentValuePerc = Math.abs(segmentValue/value.data.totalArcs);
                var item = {
                    category : options.dataViews[0].categorical.categories[0].values[i].toString()
                    , value : itemValue
                    , valueFormat : metadataValues.mesureFormat
                    , color : this.colorPalette.getColor(options.dataViews[0].categorical.categories[0].values[i].toString()).value
                    , totalSegments : totalvalpos
                    , totalArcs : totalvalneg
                    , isPositive : false
                    , sumIsPositive : sumIsPositive
                    , negativeValue : 0
                    , negativeCategory : ""
                    , negativeColor: ""
                    , selectionId : this.selectionId

                    
                    , segmentValuePositive : 0
                    , segmentPercPositive:0
                    , arcValuePositive : 0
                    , arcPercPositive : 0

                    , segmentValueNegative : 0
                    , segmentPercNegative : 0
                    , arcValueNegative : 0
                    , arcPercNegative : 0

                    , order : negOrder

                    , tooltips : mylisttooltips
                    
                   
                }
                dataneg.push(item);
                negOrder++;
                
            }
        }
        
            

        /** Compute the position of each group on the pie. Note that we're specifying the type after d3.pie
         *  so that we can access the properties correctly and TypeScript will validate our code if we get it
         *  wrong :)
         */
        console.log('Creating pie function...');
        let pie = d3.pie<ItrahcEipData>()
            .value((d) => d.value);

        /** Now, we'll build the pie chart */
        console.log('Drawing chart...');
        
        //segments to end of pie
        /*
        container
            .selectAll('*')
            .data(pie(data))
            .enter()
            .append('path')
                .attr('d', d3.arc<d3.PieArcDatum<ItrahcEipData>>()
                    .innerRadius(0)
                    .outerRadius(radius)
                )
                .attr('fill', (d) => d.data.color)
                .attr('stroke', 'black')
                .style('stroke-width', '0px')
                
                //.style('opacity', 0.7);
        this.tooltipServiceWrapper.addTooltip(container.selectAll('*'),
                (tooltipEvent: TooltipEventArgs<ItrahcEipData>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<ItrahcEipData>) => tooltipEvent.data.selectionId
            );
        */

        //var totalvalpos = 9+20+30+8+12;
        let totalArea : number = Math.PI * Math.pow(radius,2);            
        let areaPerUnit : number = totalArea / totalvalpos ;
        if (!sumIsPositive) areaPerUnit = Math.abs(totalArea/totalvalneg);
        let stepByUnit :number = 1 / totalvalpos;
        let valueacum : number = 0
        let innerr : number = radius; 
        let outerr : number =radius;
        //var copyData = data;
        for(let i:number=0; i<dataneg.length; i++){
            var actualItem = dataneg[i];
            var actualValue = actualItem.value;
            var actualColor = actualItem.color;
            var actualCategory = actualItem.category;

            var falseItem = actualItem;
            falseItem.value = -1*actualItem.value;

            //let falseSerie : ItrahcEipData[] =  data;
            var falseSerie = JSON.parse(JSON.stringify(data));
            for(let j:number=0;j<falseSerie.length;j++){
                falseSerie[j].negativeValue = actualValue;
                //falseSerie[j].isPositive = false;
                falseSerie[j].negativeCategory = actualCategory;
                falseSerie[j].selectionId = actualItem.selectionId;
                falseSerie[j].negativeColor = actualColor;
                falseSerie[j].totalArcs = actualItem.totalArcs;
                falseSerie[j].isPositive = actualItem.isPositive;
                
                //falseSerie[j].arcValuePositive= actualValue*(actualItem.value/actualItem.totalSegments);
                falseSerie[j].arcValuePositive= actualValue*falseSerie[j].value/actualItem.totalSegments;
                //falseSerie[j].arcPercPositive=Math.abs(falseSerie[j].arcValuePositive/actualItem.totalSegments);
                //falseSerie[j].arcPercPositive=Math.abs(actualValue*falseSerie[j].value/actualItem.totalSegments/actualItem.totalSegments);
                falseSerie[j].arcPercPositive=Math.abs(falseSerie[j].arcValuePositive/actualItem.totalSegments);
                
                //falseSerie[j].arcValueNegative = Math.abs(actualValue*actualItem.value/actualItem.totalArcs);
                falseSerie[j].arcValueNegative = Math.abs(actualValue*falseSerie[j].value/actualItem.totalArcs);
                falseSerie[j].arcPercNegative= Math.abs(falseSerie[j].arcValueNegative/actualItem.totalArcs);
                //falseSerie[j].order = actualItem.order;
                
                falseSerie[j].tooltips = actualItem.tooltips;
            };

            //let targetArea : number = -1*actualValue * areaPerUnit;
            let targetArea : number = Math.abs(actualValue * areaPerUnit);
            //por area
            innerr = Math.sqrt( Math.pow(outerr,2) - (targetArea/Math.PI) );
            
            //por radio
            //innerr = outerr + actualValue*stepByUnit*radius;
            let newcontainer = this.svg
            .append('g')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
            newcontainer
            .selectAll('*')
            .data(pie(falseSerie))
            .enter()
            .append('path')
                .attr('d', d3.arc<d3.PieArcDatum<ItrahcEipData>>()
                    .innerRadius(innerr)
                    .outerRadius(outerr)
                )
                //.attr('fill', (d) => d.data.color)
                //.attr('fill', "white")
                .attr('fill',actualColor)
                .attr('stroke', 'black')
                .style('stroke-width', '1px')
                .style('opacity', (this.visualSettings.dataColors.transparency/100));
            outerr = innerr;
            let mytooltip : ItrahcEipData;
            this.tooltipServiceWrapper.addTooltip(newcontainer.selectAll('*'),
                //(tooltipEvent: TooltipEventArgs<ItrahcEipData>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<any>) => ItrahcEipDataTooltip.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<any>) => tooltipEvent.data.data.selectionId
            );
            //last stroke
        let bordercontainer = this.svg
        .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
        bordercontainer
            .selectAll('*')
            .data(pie(data))
            .enter()
            .append('path')
                .attr('d', d3.arc<d3.PieArcDatum<ItrahcEipData>>()
                    .innerRadius(innerr)
                    .outerRadius(innerr)
                )                    
                .attr('stroke', 'black')
                .style('stroke-width', '1px')
                .style('opacity', 0.3);
        }
        
        //segments to proportional arc
        container
            .selectAll('*')
            .data(pie(data))
            .enter()
            .append('path')
                .attr('d', d3.arc<d3.PieArcDatum<ItrahcEipData>>()
                    .innerRadius(0)
                    .outerRadius(innerr)
                )
                .attr('fill', (d) => d.data.color)
                .attr('stroke', 'black')
                .style('stroke-width', '0px');
                
        //.style('opacity', 0.7);
        //this.sele
        //this.tooltipServiceWrapper.show();
        /*
        this.tooltipServiceWrapper.addTooltip(container.selectAll('*'),
            (tooltipEvent: TooltipEventArgs<ItrahcEipData>) => ItrahcEipDataTooltip.getTooltipData(tooltipEvent.data),
            (tooltipEvent: TooltipEventArgs<ItrahcEipData>) => tooltipEvent.data.selectionId
        );
        */
        this.tooltipServiceWrapper.addTooltip(container.selectAll('*'),
            (tooltipEvent: TooltipEventArgs<any>) => ItrahcEipDataTooltip.getTooltipData(tooltipEvent.data),
            (tooltipEvent: TooltipEventArgs<any>) => tooltipEvent.data.data.selectionId
        );
        
        //this.tooltipServiceWrapper.show();
        
        
        
        //text labels
        //debugger;
        if (this.visualSettings.dataLabels.show){
            let cracyLabels :boolean = this.visualSettings.dataLabels.cracyLabels;
            
            let mylabels = this.svg
                .selectAll('mySlices')
                //.selectAll('*')
                .data(pie(data))
                .enter()
                .append('text')
                .text(function(d){ return d.data.category})
                //.attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
                .attr("transform", function(d) { 
                    //debugger;
                    let mywidth = width/2,myheight = height/2
                        ,angulo = d.startAngle+(d.endAngle-d.startAngle-Math.PI)/2
                        ,angulodegrees = angulo*180/Math.PI
                        , myradius = innerr/2;
                    mywidth = mywidth + myradius*Math.cos(angulo);
                    myheight = myheight + myradius*Math.sin(angulo);
                    let retorno : string = "translate(" + mywidth + "," + myheight + ")";
                    if(cracyLabels) retorno += "rotate(" + angulodegrees + ")";
                    return retorno;
                    //return "translate(" + mywidth + "," + myheight + ")rotate(" + angulodegrees + ")" ;
                })
                .style("text-anchor", "middle")
                .style("font-size", this.visualSettings.dataLabels.fontSize.toString()+"pt")
                .style("fill", this.visualSettings.dataLabels.fontColor);
            this.tooltipServiceWrapper.addTooltip(mylabels,
                //(tooltipEvent: TooltipEventArgs<ItrahcEipData>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<any>) => ItrahcEipDataTooltip.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<any>) => tooltipEvent.data.data.selectionId
            );
            var labelFontSize = this.visualSettings.dataLabels.fontSize;
            let myneglabels = this.svg
                //.selectAll('mySlices')
                //.selectAll('*')
                .selectAll('myNegSlices')
                //.select('myNegSlices')
                //.selectAll('')
                .data(pie(dataneg))
                .enter()
                .append('text')
                .text(function(d){ return d.data.category})
                //.attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
                .attr("transform", function(d) { 
                    debugger;
                    let mywidth = width/2,myheight = height/2
                        ,angulo = d.startAngle+(d.endAngle-d.startAngle-Math.PI)/2
                        ,angulodegrees = angulo*180/Math.PI
                        , myradius = innerr/2;
                    mywidth = 5;
                    myheight = d.data.order * (labelFontSize  +2);
                    let retorno : string = "translate(" + mywidth + "," + myheight + ")";
                    //if(cracyLabels) retorno += "rotate(" + angulodegrees + ")";
                    return retorno;
                    //return "translate(" + mywidth + "," + myheight + ")rotate(" + angulodegrees + ")" ;
                })
                .style("text-anchor", "left") 
                .style("font-size", this.visualSettings.dataLabels.fontSize.toString()+"pt")
                //.style("fill", this.visualSettings.dataLabels.fontColor);
                .style("fill", function(d){return d.data.color});
            /*
            this.tooltipServiceWrapper.addTooltip(myneglabels,
                (tooltipEvent: TooltipEventArgs<any>) => ItrahcEipDataTooltip.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<any>) => tooltipEvent.data.data.selectionId
            );
            */
            
        }
        /** All finished  */
        console.log('Rendered!');

        this.HandleLandingPage(options);
    }
    

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        //debugger;
        return VisualSettings.enumerateObjectInstances(/*this.settings*/ this.visualSettings || VisualSettings.getDefault(), options);
    }

    /*
   private getTooltipData(value: any): VisualTooltipDataItem[] {
        //let language = getLocalizedString(this.locale, "LanguageKey");
        //_this.options.host.locale;
        let percentFormat = valueFormatter.create({ format: "0.00 %;-0.00 %;0.00 %" , cultureSelector:this.myhost.locale});
        //let numberFormat = valueFormatter.create({ format: "#,0.00" , cultureSelector:"es-US"});
        let numberFormat = valueFormatter.create({ format: "#,0.00" , cultureSelector:this.myhost.locale});
        var myValue = value.value;
        var myCategory = value.data.category;
        //var absolute = Math.abs(value.value*value.data.totalSegments/value.data.totalArcs).toFixed(2)+"%";
        var extra={};
        var retorno = [];
        if (value.data.sumIsPositive){
            //if (value.data.negativeValue<0) {
            if (!value.data.isPositive) {
                var arcValue = value.data.negativeValue*(value.value/value.data.totalSegments);
                var arcValuePerc = Math.abs(arcValue/value.data.totalSegments);
                extra = {
                    displayName: "Residual value: ",
                    value: "Value: " + numberFormat.format(arcValue) + " (" + percentFormat.format(arcValuePerc) + " of total pie)",
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
                var segmentValue = Math.abs(myValue*value.data.totalArcs/value.data.totalSegments);
                var segmentValuePerc = segmentValue/value.data.totalSegments;
                
                extra = {
                    displayName: "Residual value:",
                    value: "Value: " + numberFormat.format(segmentValue) + " (" + percentFormat.format(segmentValuePerc) + " of total pie)",
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
                var myvalue = Math.abs(value.data.negativeValue)
                var arcValue = Math.abs(myvalue*(value.value/value.data.totalArcs));
                var arcValuePerc = Math.abs(arcValue/value.data.totalArcs);
                extra = {
                    displayName: "Residual value: ",
                    value: "Value: " + numberFormat.format(arcValue) + " (" + percentFormat.format(arcValuePerc) + " of total pie)",
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
                var segmentValue = Math.abs(myValue*value.data.totalSegments/value.data.totalArcs);
                var segmentValuePerc = Math.abs(segmentValue/value.data.totalArcs);
                extra = {
                    displayName: "Residual value:",
                    value: "Value: " + numberFormat.format(-1*segmentValue) + " (" + percentFormat.format(segmentValuePerc) + " of total pie)",
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
    */
}
