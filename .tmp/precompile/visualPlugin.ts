import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var trahciep1F0E0A25631C4BF690FD682B8A208224_DEBUG: IVisualPlugin = {
    name: 'trahciep1F0E0A25631C4BF690FD682B8A208224_DEBUG',
    displayName: 'Trahceip',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["trahciep1F0E0A25631C4BF690FD682B8A208224_DEBUG"] = trahciep1F0E0A25631C4BF690FD682B8A208224_DEBUG;
}

export default trahciep1F0E0A25631C4BF690FD682B8A208224_DEBUG;