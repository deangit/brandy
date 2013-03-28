/**
 * @author dean
 * layers.js 20130301 dchiang 
 * Functions for managing map layers, layer list, and Active Layer
 */
//==== DATA MODEL ====
var SAMPLE_FEATURE_LAYER_REST_JSON = {
	"currentVersion": 10.11,
	"id": 28,
	"name": "DS0160_20050926",
	"type": "Feature Layer",
	"description": "Vegetation - Suisun Marsh 1999 [ds160]",
	"definitionExpression": "",
	"geometryType": "esriGeometryPolygon",
	"copyrightText": "",
	"parentLayer": null,
	"subLayers": [],
	"minScale": 0,
	"maxScale": 0,
	"defaultVisibility": false,
	"extent": {
		"xmin": -1.3596279133227041E7,
		"ymin": 4585998.3834688375,
		"xmax": -1.3564205726680903E7,
		"ymax": 4614988.054583764,
		"spatialReference": {
			"wkid": 102100,
			"latestWkid": 3857
		}
	},
	"hasAttachments": false,
	"htmlPopupType": "esriServerHTMLPopupTypeAsHTMLText",
	"displayField": "VEG_LEGEND",
	"typeIdField": null,
	"fields": [{
		"name": "OBJECTID",
		"type": "esriFieldTypeOID",
		"alias": "OBJECTID",
		"domain": null
	}, {
		"name": "AREA_99",
		"type": "esriFieldTypeDouble",
		"alias": "AREA_99",
		"domain": null
	}, {
		"name": "PERIMETER_",
		"type": "esriFieldTypeDouble",
		"alias": "PERIMETER_",
		"domain": null
	}, {
		"name": "COUNT_",
		"type": "esriFieldTypeDouble",
		"alias": "COUNT_",
		"domain": null
	}, {
		"name": "VEG_CODEF",
		"type": "esriFieldTypeDouble",
		"alias": "VEG_CODEF",
		"domain": null
	}, {
		"name": "VEG_LEGEND",
		"type": "esriFieldTypeString",
		"alias": "VEG_LEGEND",
		"length": 52,
		"domain": null
	}, {
		"name": "Shape",
		"type": "esriFieldTypeGeometry",
		"alias": "Shape",
		"domain": null
	}, {
		"name": "Shape.area",
		"type": "esriFieldTypeDouble",
		"alias": "SHAPE.area",
		"domain": null
	}, {
		"name": "Shape.len",
		"type": "esriFieldTypeDouble",
		"alias": "SHAPE.len",
		"domain": null
	}],
	"relationships": [],
	"canModifyLayer": false,
	"canScaleSymbols": false,
	"hasLabels": false,
	"capabilities": "Map,Query,Data",
	"maxRecordCount": 1000,
	"supportsStatistics": true,
	"supportsAdvancedQueries": true,
	"supportedQueryFormats": "JSON, AMF",
	"ownershipBasedAccessControlForFeatures": {
		"allowOthersToQuery": true
	}
}
//--Remap fields json to map from name to type and alias and other attributes 
var afieldson = {
    "fieldname1": {
        type: "string",
        alias: "field1"
    }
}

/*
 * ---- Active Layer class 
 * @constructor 
 * @return {Object} aLayer: instance of current activated layer in app.
 * Properties change depending on current target layer for tool actions.
 */
function ActiveLayer() {
    var self = this;
    
    var urid = null;
    var url = null;
	var id = -1;
    var name = null;
    var type = null;
    var geometryType = null;
    var displayField = null;
    var extent = null;
    var fields = {};
    var fieldNames = [];
    var fieldTypes = [];
    var outFields = [];
    var sqlWhere = null;
    self.urid = null;
    self.url = null;
	self.id = id;
    self.name = null;
    self.type = null;
    self.geometryType = null;
    self.displayField = null;
    self.extent = null;
    self.fields = {};
    self.fieldNames = [];
    self.fieldTypes = [];
    self.outFields = [];
    self.sqlWhere = null;
    
    return this;
    //DONE ActiveLayer class
}
ActiveLayer.prototype.setFields = function (fields) {
    console.log("DO ActiveLayer.setFields: " + fields.length);
    for (var i = 0; i < fields.length; i++) {
        this.fields[fields[i].name] = {
            "type": fields[i].type,
            "alias": fields[i].alias
        };
        this.fieldNames.push(fields[i].name);
        this.fieldTypes.push(fields[i].type);
    }
}
ActiveLayer.prototype.restInfo = function(json){
	console.log("DO ActiveLayer.restInfo ");//Set REST info into aLayerJson
	this.currentVersion = json.currentVersion; //10.11,
	this.definitionExpression = json.definitionExpression;// "",
    this.description = json.description;// "California Department of Fish and Game (DFG) Facilities\n",
    this.displayField = json.displayField;// "NAME",
	this.geometryType = json.geometryType;// "esriGeometryPoint",
	this.defaultVisibility = json.defaultVisibility;// false,
	this.extent = json.extent;//{xmin..}
	this.hasAttachments = json.hasAttachments;// false,
	this.htmlPopupType = json.htmlPopupType;// "esriServerHTMLPopupTypeNone",
    this.name = json.name;// "DFG Facilities",
    this.type = json.type;// "Feature Layer",
    //this.relationships = json.relationships;//TODO
	this.setFields(json.fields);
}

