/*
*  Power BI Visual CLI
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
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem; 
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
import powerbiVisualsApi from "powerbi-visuals-api";
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
import { createTooltipServiceWrapper, TooltipEventArgs, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";



import { VisualSettings } from "./settings";

import { valueFormatter } from "powerbi-visuals-utils-formattingutils";



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
const DefaultHandleTouchDelay = 1000;



export class Visual implements IVisual {
    
    private target: HTMLElement;
    private svg: d3.Selection<any, any, any, any>; 
    private colorPalette:IColorPalette; 
    private visualSettings: VisualSettings;
    private selectionManager : ISelectionManager;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
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
        titulo.textContent = "Danding page test.";
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

    constructor(options: VisualConstructorOptions) {
        this.myhost = options.host;
        console.log('Visual constructor', options);
        this.colorPalette = options.host.colorPalette;
        //this.selectionManager = options.host.createSelectionManager();
        this.element = options.element;
        this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
        
        this.HandleLandingPage(null);
        this.svg = d3
                .select(options.element)
                .append('svg')
                .classed('pieChart', true);

    }
    

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

    public update(options: VisualUpdateOptions) {
        
        //this.selectionId = this.myhost.createSelectionIdBuilder().withCategory("a",1).createSelectionId();   
        let dataView: DataView = options.dataViews[0];
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
        for(var i = 0;i<options.dataViews[0].categorical.categories[0].values.length;i++){
            this.selectionId = this.myhost.createSelectionIdBuilder().withCategory(options.dataViews[0].categorical.categories[0],i).createSelectionId();   
            var itemValue =  Number.parseFloat( options.dataViews[0].categorical.values[0].values[i].toString()); 
            if (!sumIsPositive) itemValue = -1*itemValue;
            //if (options.dataViews[0].categorical.values[0].values[i].valueOf()>0) {
            if(itemValue>0){
                //this.selectionId.with
                var item = {
                    category : options.dataViews[0].categorical.categories[0].values[i].toString()
                    , value : itemValue
                    , color : this.colorPalette.getColor(options.dataViews[0].categorical.categories[0].values[i].toString()).value
                    , totalSegments : totalvalpos
                    , totalArcs : totalvalneg
                    , isPositive : true
                    , sumIsPositive : sumIsPositive
                    , negativeValue : 0
                    , negativeCategory : ""
                    , negativeColor : ""
                    , selectionId : this.selectionId
                }
                data.push(item);
                                    
            } else {
                var item = {
                    category : options.dataViews[0].categorical.categories[0].values[i].toString()
                    , value : itemValue
                    , color : this.colorPalette.getColor(options.dataViews[0].categorical.categories[0].values[i].toString()).value
                    , totalSegments : totalvalpos
                    , totalArcs : totalvalneg
                    , isPositive : false
                    , sumIsPositive : sumIsPositive
                    , negativeValue : 0
                    , negativeCategory : ""
                    , negativeColor: ""
                    , selectionId : this.selectionId
                }
                dataneg.push(item);
                
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
                //falseSerie[j].value = Math.abs(falseSerie[j].value);
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
                .style('opacity', 1);
            outerr = innerr;
            this.tooltipServiceWrapper.addTooltip(newcontainer.selectAll('*'),
                (tooltipEvent: TooltipEventArgs<ItrahcEipData>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<ItrahcEipData>) => tooltipEvent.data.selectionId
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
                .style('stroke-width', '0px')
                
                //.style('opacity', 0.7);
        this.tooltipServiceWrapper.addTooltip(container.selectAll('*'),
                (tooltipEvent: TooltipEventArgs<ItrahcEipData>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<ItrahcEipData>) => tooltipEvent.data.selectionId
            );
        
        
        //text labels
        debugger;
        
        this.svg
            .selectAll('mySlices')
            //.selectAll('*')
            .data(pie(data))
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
                mywidth = mywidth + myradius*Math.cos(angulo);
                myheight = myheight + myradius*Math.sin(angulo);
                return "translate(" + mywidth + "," + myheight + ")rotate(" + angulodegrees + ")" ;
            })
            .style("text-anchor", "middle")
            .style("font-size", "47px")
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
        return VisualSettings.enumerateObjectInstances(/*this.settings*/ this.visualSettings || VisualSettings.getDefault(), options);
    }
}
