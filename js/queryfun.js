/**
 * @author dchiang
 * queryfun.js 20130201 dean 20130311
 * Query Task related Functions reusable by different app functionality.
 * REQ: dojo.require("esri.tasks.query")
 * TIP: query.outfields cannot be wildcard like '*'
 */

var queryDrill = null; //=subquery of main query result
var queryFilter = null; //=subquery input params

/*
 * --- Query for all values of a data field and returns a featureSet
 * @param {String} fieldname: attribute name to get list of values
 * @param {String} url: REST URL to the Active Layer
 * @param {Object} callback: a function to process the query results 
 */
function queryListOfValues(fieldname, url, callback) {
    console.log("DO getFieldValues: " + [fieldname, url].join(", "));
    //build query
    queryTask = new esri.tasks.QueryTask(url);
    //build query filter
    query = new esri.tasks.Query();
    query.returnGeometry = false;
    query.outFields = [fieldname];
    query.where = fieldname + " IS NOT NULL "; 
    //execute query
    queryTask.execute(query, callback);
}
/*
 * --- Create a picklist of field values by query result feature set
 * @param {JSON} res: query task result.
 * @param {Object} sel: a select element.
 * @param {String} fieldname: the field in the query result to get the values.
 * @param {String} fieldtype: the field datatype to determine whether to wrap 
 *  the value with single quotes to aid in SQL WHERE clause.
 * CALLER: QueryBuilder.getValues - a callback fxn arg for queryListOfValues
 */
function picklistFieldValuesQueryResult(res, sel, fieldname, fieldtype) {
	console.log("DO picklistFieldValuesQueryResult: (" + res.features.length + ") " + sel.id);
	sel.length = 0;
	for (var i = 0; i < res.features.length; i++) {
		//if (feature.attributes[fieldname] != null) {
		//}
		var feature = res.features[i];
		var opt = document.createElement("option");
		opt.id = sel.id + ":" + i;//TODO: use OBJECTID?
		opt.value = feature.attributes[fieldname];
		if (fieldtype.toLowerCase().indexOf("string") >= 0) {
			opt.innerHTML = "'" + feature.attributes[fieldname] + "'";
		} else {
			opt.innerHTML = feature.attributes[fieldname];
		}
		sel.add(opt, sel.options[null]);
		//sel.appendChild(opt);
	}
}//DONE picklistFieldValuesQueryResult

/*
 * --- Generic Feature Layer Query wrapper
 * @param {String} url: REST URL to the feature layer, REQUIRED
 * @param {String} sql: WHERE clause to send to query.
 * @param {Boolean} getshape: whether to return geometry from query.
 * @param {Array} outfields: output field names to query.
 *   If not set returns only default display field.
 * @param {Object} callback: a function to process successful response.
 * A very forgiving function that will do something unless missing url.
 */
function queryFeaturesWhere(url, getshape, callback, sql, outfields) {
    console.log("DO queryFeaturesWhere: " + sql + " on " + url);
	if (getshape == undefined) {
		var getshape = false;
	}
	if (callback == undefined) {
		var callback = function (res) {
			console.log("DO CALLBACK on queryFeatureWhere/queryTask.execute: " + res);
		}
	}
	if (sql == undefined) {
		var sql = "OBJECTID >= 0 AND OBJECTID < 500";
	}
    // Build query
    queryTask = new esri.tasks.QueryTask(url);
    // Build query filter
    query = new esri.tasks.Query();
	if (outfields != undefined) {
		query.outFields = outfields;
	}
    query.returnGeometry = getshape;//true
    query.where = sql; 
    // Execute query
    queryTask.execute(query, callback);
}



//==== SAMPLES ===========================================
//CODE: http://help.arcgis.com/en/webapi/javascript/arcgis/jssamples/#sample/query_nomap 
//DEMO: http://help.arcgis.com/en/webapi/javascript/arcgis/samples/query_nomap/index.html
function initTextQuery(){
	//build query
	queryTask = new esri.tasks.QueryTask("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/5");
	
	//build query filter
	query = new esri.tasks.Query();
	query.returnGeometry = false;
	query.outFields = ["SQMI", "STATE_NAME", "STATE_FIPS", "SUB_REGION", "STATE_ABBR", "POP2000", "POP2007", "POP00_SQMI", "POP07_SQMI", "HOUSEHOLDS", "MALES", "FEMALES", "WHITE", "BLACK", "AMERI_ES", "ASIAN", "OTHER", "HISPANIC", "AGE_UNDER5", "AGE_5_17", "AGE_18_21", "AGE_22_29", "AGE_30_39", "AGE_40_49", "AGE_50_64", "AGE_65_UP"];
}

function executeTextQuery(whereDisplayFieldLike){
	query.text = whereDisplayFieldLike;
	//execute query
	queryTask.execute(query, showResults);
}

function showResults(results){
	var s = "";
	for (var i = 0, il = results.features.length; i < il; i++) {
		var featureAttributes = results.features[i].attributes;
		for (att in featureAttributes) {
			s = s + "<b>" + att + ":</b>  " + featureAttributes[att] + "<br />";
		}
	}
	dojo.byId("info").innerHTML = s;
}

//==== DATA MODEL =========================================================
//--- JSAPI Query result FeatureSet json structure
SAMPLE_QueryResultJson = {
    "displayFieldName": "Name",
    "fieldAliases": {
        "NAME": "NAME"
    },
    "fields": [{
        "name": "NAME",
        "type": "esriFieldTypeString",
        "alias": "NAME",
        "length": 32
    }],
    "features": [{
        "geometry": null,
        "attributes": {
            "NAME": "Lake of the Woods"
        }
    }, {
        "geometry": null,
        "attributes": {
            "NAME": "Ferry"
        }
    }, {
        "geometry": null,
        "attributes": {
            "NAME": "Stevens"
        }
    }, {
        "geometry": null,
        "attributes": {
            "NAME": "DeKalb"
        }
    }],
    "spatialReference": {}
}

//==== CONSTANTS ==========================================
var kEsriFieldTypes = [
"esriFieldTypeBoolean",
"esriFieldTypeDate",
"esriFieldTypeDouble",
"esriFieldTypeGeometry",
"esriFieldTypeInteger",
"esriFieldTypeOID",
"esriFieldTypeSmallInteger",
"esriFieldTypeString"
];
var kEsriFieldTypeList = "|" + kEsriFieldTypes.join("|") + "|";

//--- Sample fields info from rest json
var sampleFields = [
  {
   "name": "OBJECTID",
   "type": "esriFieldTypeOID",
   "alias": "OBJECTID",
   "domain": null
  },
  {
   "name": "NAME",
   "type": "esriFieldTypeString",
   "alias": "Name",
   "length": 50,
   "domain": null
  },
  {
   "name": "FAC_TYPE",
   "type": "esriFieldTypeString",
   "alias": "Facility Type",
   "length": 50,
   "domain": null
  },
  {
   "name": "REGION",
   "type": "esriFieldTypeDouble",
   "alias": "Region",
   "domain": null
  },
  {
   "name": "Shape",
   "type": "esriFieldTypeGeometry",
   "alias": "Shape",
   "domain": null
  }
 ];

