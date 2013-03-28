/**
 * @author dchiang
 * gtable.js 20130222 - 20130311
 * Google Visualization Table API for displaying tabular data 
 * output from query results. 
 * REF: https://developers.google.com/chart/interactive/docs/gallery/table
 * 
 */

google.load('visualization', '1', {packages:['table']});

var gdata = null;// new google.visualization.DataTable();//=undef at startup
var gtable = null; //=the Google table object connected to page UI.

//google.setOnLoadCallback(drawTable);

//--- Google table data types matched to Esri field types 
var gdatatypeFromEsriFieldTypes = {
"esriFieldTypeBoolean": "boolean",
"esriFieldTypeDate": "date",
"esriFieldTypeDouble": "number",
"esriFieldTypeGeometry": "object",
"esriFieldTypeInteger": "number",
"esriFieldTypeOID": "number",
"esriFieldTypeSmallInteger": "number",
"esriFieldTypeString": "string"
}

/*
 * --- Display query task response feature set in gtable data view
 * CALLER: QueryBuilder.queryGo/queryFeaturesWhere.oncallback 
 */
function gtableQueryResult(featureSet){
    console.log("DO gtableQueryResult: " + featureSet.fields.length + " cols, " + featureSet.features.length + " rows (" + aLayer.geometryType);

    map.infoWindow.hide();
    map.graphics.clear();
    gdata = new google.visualization.DataTable();
    var cols = [];
    var fields = featureSet.fields;
    for (var i = 0; i < fields.length; i++) {
        gdata.addColumn(gdatatypeFromEsriFieldTypes[fields[i].type], fields[i].name);
        //cols.push(fields[i].name + "(" + gdatatypeFromEsriFieldTypes[fields[i].type] + ")");
        cols.push(fields[i].alias + ": ${" + fields[i].name + "}");
    }
    //console.log(cols.join("\t"));
    // Create the infoTemplate to be used in the infoWindow.
    // All ${attributeName} will be substituted with the attribute value for current feature.
    //infoTemplate = new esri.InfoTemplate("${STATE_NAME}", "State Fips: ${STATE_FIPS}<br />Abbreviation: ${STATE_ABBR}<br />Area: ${AREA}");
    infoTemplate = new esri.InfoTemplate("${" + featureSet.displayFieldName + "}", cols.join("<br />"));
    
    var rows = [];
    var features = featureSet.features;
    for (var j = 0; j < features.length; j++) {
        var attributes = features[j].attributes;
        var rowdata = [];
        for (var col in attributes) {
            rowdata.push(attributes[col]);
        }
        rows.push(rowdata);
        //console.log(rowdata.join("\t"));
    }
    gdata.addRows(rows);
    gtable = new google.visualization.Table(document.getElementById('gtable_div'));
    gtable.draw(gdata, {
        showRowNumber: true,
        allowHtml: true//,
        //page: 'enable',
        //pageSize: 10
    });
    
    // Add our selection handler.
    google.visualization.events.addListener(gtable, 'select', gtableOnSelect);
    // The selection handler.
    // Loop through all items in the selection and concatenate
    // a single message from all of them.
    function gtableOnSelect(){
        var oid = gdata.getValue(gtable.getSelection()[0].row, 0);
        console.log("Show feature OID=" + oid);
    }
    
    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.5]));

    //QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.
    dojo.forEach(featureSet.features, function(feature){
        var graphic = feature;
        graphic.geometry = esri.geometry.geographicToWebMercator(feature.geometry);
        graphic.setSymbol(symbol);
        //Set the infoTemplate.
        graphic.setInfoTemplate(infoTemplate);
        
        //Add graphic to the map graphics layer.
        map.graphics.add(graphic);
    });
    //zoomToGraphics=FAIL without projecting feature result from query on wkid2469 data.
	//=ERROR: Map: Geometry (wkid: 4269) cannot be converted to spatial reference of the map (wkid: 102100) serverapi.arcgisonline.com:34
    //map.setExtent(esri.geometry.geographicToWebMercator(esri.graphicsExtent(map.graphics.graphics)));
	//=OK if graphics not projected to 102100, else just do 
    map.setExtent(esri.graphicsExtent(map.graphics.graphics));
    //DONE gtableQueryResult
}

/*
 * +++++++++++++++++++++++ SAMPLE CODE ++++++++++++++++++++++++++++++++++++
 * REF= https://developers.google.com/chart/interactive/docs/gallery/table
 */
//google.load('visualization', '1', {packages:['table']});
//google.setOnLoadCallback(drawTable);
function drawTable(){
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Name');
	data.addColumn('number', 'Salary');
	data.addColumn('boolean', 'Full Time Employee');
	data.addRows([['Mike', {
		v: 10000,
		f: '$10,000'
	}, true], ['Jim', {
		v: 8000,
		f: '$8,000'
	}, false], ['Alice', {
		v: 12500,
		f: '$12,500'
	}, true], ['Bob', {
		v: 7000,
		f: '$7,000'
	}, true]]);
	
	var table = new google.visualization.Table(document.getElementById('gtable_div'));
	table.draw(data, {
		showRowNumber: true
	});
}
