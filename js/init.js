/**
 * init.js 20130131 dean 20130201
 * On Page Load routines
 */
//========================================
//--- On Page Load Initialization
//========================================
function init() {
	console.log("DO init ");
	initConfig();

    var extent = new esri.geometry.Extent({
        "xmin": -13022985,
        "ymin": 3922153,
        "xmax": -11799993,
        "ymax": 4533650,
        "spatialReference": {
            "wkid": 102100
        }
    });
    map = new esri.Map("map", {
        basemap: "streets",
        center: [-121.345, 37.896],
        zoom: 8
    });

    map.addLayer(new esri.layers.ArcGISDynamicMapServiceLayer(aMapServerUrl, {
        opacity: 0.4,
        id: aMapLayerId
    }));

    dojo.connect(map, "onClick", doQuery);

    queryTask = new esri.tasks.QueryTask(aLayerUrl);

    dojo.connect(queryTask, "onComplete", getChart);

    dojo.connect(map.infoWindow, "onHide", function () {
        map.graphics.clear();
    });

    query = new esri.tasks.Query();
    query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
    query.outFields = ["NAME", "WHITE", "BLACK", "ASIAN", "HISPANIC", "OTHER"];
    query.returnGeometry = true;
    query.outSpatialReference = {
        "wkid": 102100
    };

    map.infoWindow.resize(275, 150);

    initQueryBuilder();
    $("app-title").innerHTML = appTitle;
    initViews();
	
} //DONE init

dojo.ready(init);


//=========================================
//---- Query and Charts --from original sample
//=========================================
function doQuery(evt) {
    click = query.geometry = evt.mapPoint;
    queryTask.execute(query);
}

function getChart(featureSet) {
    map.graphics.clear();
    var features = featureSet.features;
    var feature, attributes, white, black, asian, hispanic, other, total, graphic;
    for (var i = 0; i < features.length; i++) {
        feature = features[i];
        attributes = feature.attributes;

        white = parseInt(attributes.WHITE);
        black = parseInt(attributes.BLACK);
        asian = parseInt(attributes.ASIAN);
        hispanic = parseInt(attributes.HISPANIC);
        other = parseInt(attributes.OTHER);

        total = white + black + asian + hispanic + other;

        white = (white / total) * 100;
        black = (black / total) * 100;
        asian = (asian / total) * 100;
        hispanic = (hispanic / total) * 100;
        other = (other / total) * 100;

        var params = dojo.mixin({
            chf: "bg,s,FFFFFF50",
            chs: wd + "x" + ht,
            chd: "t:" + white + "," + black + "," + hispanic + "," + asian + "," + other
        }, chartParams);

        var mySymbol = new esri.symbol.SimpleFillSymbol("none", new esri.symbol.SimpleLineSymbol("dashdot", new dojo.Color([255, 0, 0]), 2.5), new dojo.Color([255, 255, 0, 0.25]));

        feature.setSymbol(mySymbol);
        map.graphics.add(feature);

        map.infoWindow.setTitle(attributes["NAME"]);
        console.log("infowindow");
        map.infoWindow.setContent("<img src=\"" + "http://chart.apis.google.com/chart?" +
				decodeURIComponent(dojo.objectToQuery(params)) +
				"\" />");

        map.infoWindow.show(map.toScreen(click), map.getInfoWindowAnchor(map.toScreen(click)))
    }
}//DONE getChart


//=========================================
//--- Mix Application Types Esri Config
//=========================================
function initConfig(){
	console.log("DO initConfig ");
    console.log("app page= " + appPage);
	if (appPage == "Default.aspx") {
		esri.config.defaults.io.proxyUrl ="proxy.ashx";// "/proxy/proxy.ashx"; //
		esri.config.defaults.io.alwaysUseProxy = alwaysUseProxy;
	}
	else {
		esri.config.defaults.io.proxyUrl = "proxy.php"; //REQ for esri.request
		esri.config.defaults.io.alwaysUseProxy = alwaysUseProxy;
        
        pageLoad();
	}
}

//===================================
//--- Event Handlers for UI Views
//===================================
function initViews() {
    dojo.connect($("tools"), "onclick", function () {
		toggle("tools-view");
	});
    dojo.connect($("tools-view"), "onclick", function () {
        toggle("tools-view");
    });
    dojo.connect($("tool-data"), "onclick", function () {
        toggle("data-view");
    });
}//DONE initViews
