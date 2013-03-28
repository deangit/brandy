/**
 * app.js 20130131 dean 20130211
 * All the application setup except for init.js, the on page load script
 */
//==================================
//--- Import JS Libs and Modules
//==================================
//--- Required dojo modules---
dojo.require("esri.map");
dojo.require("esri.tasks.query");
dojo.require("esri.utils");


//--- Load Google JS API like Charts, Tables---
//google.load('visualization', '1', { packages: ['table'] });//@gtable.js
// Other Google Visualization packages
//google.load('visualization', '1', {'packages':['piechart', 'table', 'linechart']});


//--- Local JS Libraries to load dynamically---
jsfiles = ["bj.js"
,"gtable.js"
,"querybuilder.js"
,"queryfun.js"
];

for (j = 0; j < jsfiles.length; j++) {
    document.writeln('<' + 'script type="text/javascript" src="js/' + jsfiles[j] + '"><' + '/' + 'script>');
}


//====================================
//--- Application Global Variables
//====================================
var map, queryTask, query, click;
var wd = 240;
var ht = 110;
var chartParams = { cht: "p3", chl: "White|Black|Hispanic|Asian|Other" };

//--- GLOBALS for managing Active Layer - SEE ALSO aLayer @querybulder.js
var aMapServerUrl = "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer";
//aMapServerUrl = "https://map.dfg.ca.gov/arcgis/rest/services/Base_Maps/GeoReference/MapServer";
var aLayerId = 3; //=lid
var aLayerName = null;
var aLayerUrl = aMapServerUrl + "/" + aLayerId;
var aLayerUrid = aMapLayerId + ":" + aLayerId; //urid=msid+":"+lid

var alwaysUseProxy = false;
var aMapFolder = "Demographics";
var aMapLayerId = "ESRI_Census_USA"; //=msid
//aMapLayerId = "GeoReference";
var appTitle = aMapFolder;

var fieldSkipList = "|Shape|SHAPE|shape|";

//--Common fxn inputs
var urid = null; //=unique resource ID to the data layer = mapServerId:layerId
var url = null; //=URL to the map service or feature layer being queried

var infoTemplate = null;
var symbol = null;//esri namespace still undefined at this point in page load

//====================================
//--- Application Debug Console, Diagnostics, Messaging, and Test Methods
//====================================

function hello (msg) {
    console.log("hello: " + msg);
    if (msg != undefined) {
        alert("Hello " + msg);
    }
}
function doOnClick (e) {
    var uiid = targetId(e);
    var uig = uiid.split("-")[0];//=UI View Group base name or prefix
    if (uig != null) {
		console.log("UI view group base name or prefix= " + uig);
	}
    alert("CLICKED " + uiid);
}
