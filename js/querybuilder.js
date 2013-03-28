/**
* @author dchiang
* querybuilder.js 20130111 dean 20130311
* Query Builder view model and functions
* NOTE: HTML entities become string literals in input value. 
* Best use unicode (as js escaped \xNN or hex \uABCD).
* BUG: if display field in mxd written in diff case than actual field name, 
*   displayField cannot be removed from outFields.--20130212
* NEXT: on query go callback fxn to display results.
*/
//==== GLOBALS ===========================================================
//--- Current Active Layer Properties
var aLayer = {
    urid: "ESRI_Census_USA:3",
    url: "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/3",
    mapFolder: "Demographics",
    mapId: "ESRI_Census_USA",
    mapType: "MapServer",
    mapUrl: "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer",
	currentVersion: 10.01,
	id: 3,
    name: "Coarse Counties",
    type: "Feature Layer",
	definitionExpression: null,
	description: null,
    displayField: "Name",
    extent: null,
    fields: {},
    geometryType: "esriGeometryPolygon",
	parentLayer: null,
	subLayers: [],
	minScale: 0,
	maxScale: 1000001,
	relationships: [],
    fieldNames: [],
    fieldTypes: [],
    outFields: ["OBJECTID"],
    sqlWhere: null,
	wkid: 4269
}
var queryTask = null; //=a reusable query task object 
var query = null; //=a query input params object 
var queryResult = null;//=generic query task result json obj
var queryWhere = ""; //=the previous where clause before current new term added 
//... until query or filter is ran then finalized so can use in undo. 
//  "/*Select query parameters and conditions go here*/"
//+ "(FIELD_1 = 'value_1' AND FIELD_2 > value_2) OR FIELD_3 NOT LIKE 'value_x'";
var queryTermLast = ""; //=a term in whole where clause last added
var queryTermBack = ""; //=a term 1 back from just added for undo 

//--- Special way to save fields info from Active Layer REST JSON
// @return {Array} fieldnames: to be saved in aLayer.fieldNames 
function aLayerSetFields(fields) {
    console.log("DO aLayerSetFields: " + fields.length);
    var fson = {};
    var fieldnames = [];
    var fieldtypes = [];
    for (var i = 0; i < fields.length; i++) {
        fson[fields[i].name] = {
            "type": fields[i].type,
            "alias": fields[i].alias
        };
		fieldnames.push(fields[i].name);
		fieldtypes.push(fields[i].type);
    }
    aLayer.fields = fson;
    aLayer.fieldTypes = fieldtypes;
    console.log("DONE aLayerSetFields");
    return fieldnames;
}
//--- Save REST info from Active Layer REST JSON into aLayer object
function aLayerSetInfo(json) {
    console.log("DO aLayerSetInfo: " + json.currentVersion);
	aLayer.id = json.id;
    aLayer.name = json.name;
    aLayer.type = json.type;
    aLayer.geometryType = json.geometryType;
	aLayer.displayField = json.displayField;
	aLayer.extent = json.extent;
	aLayer.wkid = json.extent.spatialReference.wkid;
	aLayer.minScale = json.minScale;
	aLayer.maxScale = json.maxScale;
    aLayer.fieldNames = aLayerSetFields(json.fields);
    dojo.query(".active-layername")[0].innerHTML = json.name;
    console.log("DONE aLayerSetInfo");
    return json.currentVersion;
}


//==== CLASS =============================================================
/*
* --- QUERY BUILDER CLASS MODEL
* @constructor
* @param {String} id: id value of the html element of the tool panel.
* @return (Object} qb: a queryBuilder obj connected to page UI
* ASSUMES: on open load info by current Active Layer URL
* REQ: dojo.require("esri.tasks.query") loaded.
*/
function QueryBuilder(id) {
	
    var self = this;

    //--UI View connected and Instantiate Object
    if (id != undefined && $(id) != undefined) {
        self.id = id;
        var tool = $(id);
    } else {
        return alert("ERROR: Missing arg or div#" + id + " in DOM!");
    }

    //--UI Style
    tool.style.overflow = "auto";
    //--UI Nodes Reference
    var layerLabel = $(id + "-layername");
    var valuesButton = $(id + "-getvalues");
    var clearButton = $(id + "-clear");
    var undoButton = $(id + "-undo");
    var cancelButton = $(id + "-cancel");
    var goButton = $(id + "-go");
    var layerpicker = $(id + "-layers");
    var fieldpicker = $(id + "-fieldnames");
    var valuepicker = $(id + "-fieldvalues");
    var sqlbox = $(id + "-where");
	var colsButton = $(id + "-cols");
	var checklist = $(id + "-columns");
    self.layerLabel = layerLabel;
    self.valuesButton = valuesButton;
    self.layerpicker = layerpicker;
    self.fieldpicker = fieldpicker;
    self.valuepicker = valuepicker;
    self.sqlbox = sqlbox;
	self.colsButton = colsButton;
	self.checklist = checklist;
    //--Inner Properties
	var sqlWhere = "";
	var mapId = "";
	var urid = "";//=urid of the layer being queried
	var url = "";//=url of the layer being queried
	var displayField = null;
	var outFields = ["OBJECTID"];
    var result = null;
	//--Public Properties
    self.sqlWhere = sqlWhere;
    self.mapId = mapId;
	self.urid = urid;
	self.url = url;
	self.displayField = null;
	self.outFields = outFields;
    self.results = result;

    //--Model + Constants
    var operatorList = "|(|)|=|<>|>|>=|<|<=|NOT|LIKE|AND|OR|IS NULL|IS NOT NULL|IN (|";
    var operatorsid = "lpar,rpar,not,eq,ne,like,gt,gte,and,lt,lte,or,isnull,notnull,in";
    var operatorstxt = "(,),NOT,=,<>,LIKE,>,>=,AND,<,<=,OR,IS NULL,IS NOT NULL,IN (";
    var operatorstitle = "Parenthesis Begin,Parenthesis End,Is Not,Equal To,Not Equal To,Like"
	+ ",Greater Than,Greater Than or Equal To,And,Less Than,Less Than or Equal To,Or"
	+ ",Is Null,Is Not Null,In()";
    var operators = {
        "lpar": {
            value: "(",
            title: "Left Parenthesis",
            text: "("
        },
        "rpar": {
            value: ")",
            title: "Right Parenthesis",
            text: ")"
        },
        "not": {
            value: "Not",
            title: "Is Not",
            text: "NOT"
        },
        "eq": {
            value: "=",
            title: "Equal To",
            text: "="
        },
        "ne": {
            value: "&lt;&gt;",
            title: "Not Equal To",
            text: "<>"
        },
        "like": {
            value: "=",
            title: "Equal To",
            text: "LIKE"
        },
        "gt": {
            value: "&gt;",
            title: "Greater Than",
            text: ">"
        },
        "gte": {
            value: "&gt;=",
            title: "Greater Than or Equal To",
            text: ">="
        },
        "and": {
            value: "And",
            title: "Equal To",
            text: "AND"
        },
        "lt": {
            value: "&lt;",
            title: "Less Than",
            text: "<"
        },
        "lte": {
            value: "&lt;=",
            title: "Less Than or Equal To",
            text: "<="
        },
        "or": {
            value: "Or",
            title: "Or",
            text: "OR"
        },
        "isnull": {
            value: "IsNull",
            title: "Is Null",
            text: "IS NULL"
        },
        "notnull": {
            value: "NotNull",
            title: "Is Not Null",
            text: "IS NOT NULL"
        },
        "in": {
            value: "IN()",
            title: "In",
            text: "IN ("
        }
    }//end operators

    //--UI Actions ------------------------
    for (var oper in operators) {
        $(id + "-" + oper).onclick = function (e) {
            var iop = this.id.split("-")[1];
            sqlWhere = sqlbox.value;
            sqlbox.value += " " + operators[iop].text + " ";
            //operators[oper].text;//=FAIL - always points to last oper
        }
    }
    layerpicker.onchange = function (e) {
		var layerName = layerpicker.options[layerpicker.selectedIndex].innerHTML;
		var layerUrl = layerpicker.options[layerpicker.selectedIndex].value;
		var uiid = layerpicker.options[layerpicker.selectedIndex].id;
		var layerUrid = uiid.split("-")[1];
		console.log("Layer select onchange: " + layerName + "@" + layerUrl);
		//-Activate new feature layer and change list of fields and clear sqlbox
		aLayer.urid = layerUrid;
		aLayer.url = layerUrl;
		aLayer.name = layerName;
        layerLabel.innerHTML = layerName;
        sqlbox.value = "";
		valuepicker.length = 0;
		self.open(aLayer.url);
    }
    fieldpicker.ondblclick = function (e) {
        sqlWhere = sqlbox.value;
		var fieldname = fieldpicker.options[fieldpicker.selectedIndex].value;
        sqlbox.value += " " + fieldname + " ";
    }
    fieldpicker.onkeydown = function (e) {
        var ev = (window.event ? window.event : e);
        if (ev.keyCode == 13) {
			sqlWhere = sqlbox.value;
			var fieldname = fieldpicker.options[fieldpicker.selectedIndex].value;
			sqlbox.value += " " + fieldname + " ";
		}
    }
    valuesButton.onclick = function (e) {
        self.getValues(e);
    }
    valuepicker.ondblclick = function (e) {
        self.selectedValues(e);
    }
    valuepicker.onkeydown = function (e) {
        var ev = (window.event ? window.event : e);
        if (ev.keyCode == 13) {
            self.selectedValues(e);
        }
    }
	colsButton.onclick = function (e) {
		toggle(checklist.id);
	}
    clearButton.onclick = function (e) {
        sqlbox.value = "";
    }
    undoButton.onclick = function (e) {
        sqlbox.value = sqlWhere;//prev where clause saved
    }
    goButton.onclick = function (e) {
        //hello(this.id);
        //doOnClick(e);
		//TODO: Validate SQL
		if (sqlbox.value == "") {
			alert("Please build a SQL statement to query");
		} else {
			self.queryGo(e);
		}
    }
    cancelButton.onclick = function (e) {
        self.close();
    }
    //DONE QueryBuilder class
}

/*
* -------------- QUERY BUILDER METHODS --------------------
* picklistLayers(mapLayer, sel, layerId)_
* = List layers from Active Layer map service in layerpicker.
* getFields(url)_ 
* = get fieldnames to list in fieldslist and checkboxlist, 
*   equal to activate or switch Active Layer.
*/

//--- List layers from Active Layer map service in layerpicker
QueryBuilder.prototype.picklistLayers = function (mapLayer, sel, layerId) {
    console.log("DO QueryBuilder.picklistLayers: " + sel.id);
    var msid = mapLayer.id;
    var uig = sel.id.split("-")[0];
    var layerInfos = mapLayer.layerInfos;
    //$("gtable_div").innerHTML += JSON.stringify(layerInfos);
    //sel.options.length = 0;
    sel.length = 0;
    var opt = document.createElement("option");
    opt.value = "";
    opt.innerHTML = "--PICK A TARGET LAYER--";
    sel.appendChild(opt);
    for (var i in layerInfos) {
        var lid = layerInfos[i].id;
        var vis = layerInfos[i].defaultVisibility;
        var name = layerInfos[i].name;
        var plid = layerInfos[i].parentLayerId;
        var sids = layerInfos[i].subLayerIds;
        if (sids == null) {
            var urid = msid + ":" + lid;
            var url = mapLayer.url + "/" + lid;
            var opt = document.createElement("option");
            opt.id = uig + "-" + urid;
            opt.value = url;
            opt.innerHTML = name;
            if (layerId != undefined && lid == layerId) {
                opt.selected = true;
                aLayerName = name;
            }
            sel.appendChild(opt);
        }
    }
    var opt = document.createElement("option");
    opt.id = uig + "-mapId";
    opt.value = msid;
    opt.style.display = "none";
    sel.appendChild(opt);
    //sel.onchange --SEE QueryBuilder.layerpicker.onchange event handle
    this.mapId = msid;
}
/*
* Open the Query Builder tool with Active Feature Layer URL input
* to get the list of fields and set up query task.
* @param {String} url: aLayerUrl, active feature layer URL.
*/
QueryBuilder.prototype.open = function (url) {
    console.log("DO QueryBuilder.open: " + url);
    //var uiid = targetId(e);
    //var id = uiid.split("-")[0];
    //alert("this.id= " + this.id);//=OK =querybuilder
    if (hidden(this.id)) {
        show(this.id);
    }
    var urlson = layerUrlParson(url);
    //-Build the feature layers list only if tool map layer diff than input
    if (this.mapId != urlson.mapId) {
        this.picklistLayers(map.getLayer(urlson.mapId), this.layerpicker, urlson.layerId);
        this.mapId = urlson.mapId;
    }
    //-Build the field names list only if tool feature layer diff than input
    if (this.urid != aLayer.urid) {
        this.urid = urlson.mapId + ":" + urlson.layerId;
        this.url = url;
        this.getFields(url);
    }
    //-Cannot know the feature layer name from just the url
    // until REST endpoint read by getFields_callback ala activate layer
    //this.layerLabel.innerHTML = aLayer.name;// aLayerName;//HERE HARD TO TELL IF ALAYERNAME IS RIGHT
}
QueryBuilder.prototype.getFields = function (url) {
    console.log("DO QueryBuilder.getFields: " + url);
    var sender = this;
    var sel = this.fieldpicker;
    var vals = this.valuepicker;
    var colsButton  = this.colsButton;
	var colchklist = $(this.id  + "-columns");
    var checklist = this.checklist;
	var displayField = this.displayField;
	var outFields = this.outFields;
    var sqlbox = this.sqlbox;
    var layerLabel = this.layerLabel;
    var callback = function (json) {
        console.log("DO QueryBuilder.getFields CALLBACK: " + json.name);
        if (json.fields != undefined && json.fields != null && json.fields.length > 1) {
            //this.listFields(json.fields, $(this.id + "-fieldnames")); //=FAIL
            // dont know what *this* is inside callbk as typeof this.xxx==undef
			picklistFields(json.fields, sel, json.displayField);
            checklistFields(json.fields, sender, json.displayField);
            colsButton.value = json.displayField + " \u25BC";
			displayField = json.displayField;
			outFields.push(json.displayField);
        }
        //-Save Active Layer info into aLayer properties
        aLayer.currentVersion = aLayerSetInfo(json);
        sender.layerLabel.innerHTML = json.name;
        //-Create new list of out field checkboxes for new Active Layer
        checklistFields(json.fields, tool, json.displayField);//=OK. DONE.
        //-Remove picklist of old field values
        //sender.valuepicker.length = 0;//=FAIL DUE TO ABOVE NO RETURN ***
    }
    esrequest(url, { f: "json" }, "json", callback);
}
//--- List fields in picklist of attributes
QueryBuilder.prototype.listFields = function (fields, sel) {//***NOT USED
    console.log("DO QueryBuilder.listFields: (" + fields.length + ") in " + sel.id);
    for (var i = 0; i < fields.length; i++) {
        var name = fields[i].name;
        var type = fields[i].type;
        var alias = fields[i].alias;
        var domain = fields[i].domain;
        if (fieldSkipList.indexOf("|" + name + "|") < 0) {
            var opt = document.createElement("option");
            opt.id = sel.id + ":" + i;
            opt.value = name;
            opt.innerHTML = alias;
            opt.title = type;
            sel.appendChild(opt);
        }
    }
    //TODO: Attach selectlist event handler fxns
}
//--- Fill values picklist in query builder onclick of Get Values button
QueryBuilder.prototype.getValues = function (e) {
    console.log("DO " + this.id + ".getValues onclick of " + targetId(e));
	//var uiid = targetId(e);
	var fieldpicker = this.fieldpicker;
	var fieldname = fieldpicker.options[fieldpicker.selectedIndex].value;
	var fieldtype = fieldpicker.options[fieldpicker.selectedIndex].title;
    var valuepicker = this.valuepicker;
    var callback = function (res) {
        console.log("DO CALLBACK queryBuilder.getFieldValues to create values picklist");
        //console.log("Query for list of field values:<br />" + JSON.stringify(res));
		picklistFieldValuesQueryResult(res, valuepicker, fieldname, fieldtype);//@queryfun.js
    }
	queryListOfValues(fieldname, aLayerUrl, callback);//@queryfun.js
}
//--- Put user selected field values into SQL Where box when dblclick or Enter
QueryBuilder.prototype.selectedValues = function (e) {
    console.log("DO selectedValues ");
    var fvals = [];//valuepicker.selectedIndex;
    for (var i = 0; i < this.valuepicker.options.length; i++) {
        if (this.valuepicker.options[i].selected == true) {
            fvals.push(this.valuepicker.options[i].innerHTML);
        }
    }
    this.sqlWhere = this.sqlbox.value;
    this.sqlbox.value += " " + fvals.join(", ") + " ";
}
//--- Run query on Active Layer with SQL Where clause constructed
QueryBuilder.prototype.queryGo = function (e) {
	console.log("DO queryGo");
	var sqlWhere = this.sqlbox.value;
	var callback = function (res) {
		console.log("DO queryBuilder.queryGo CALLBACK...");
        //console.log("QueryBuilder.queryWhere.callbackResult:<br />" + res);
		//console.log("fields (" + res.fields.length + "), features (" + res.features.length + ")");
		//console.log("1st fieldname= " + res.fields[0].name);
		$("data-msg").innerHTML = "Query Result: " + res.features.length + " rows.";
        queryResult = res;
		gtableQueryResult(res);
	}
	queryFeaturesWhere(this.url, true, callback, sqlWhere, this.outFields);//@queryfun.js
}
QueryBuilder.prototype.close = function () {
    hide(this.id);
    console.log("DONE QueryBuilder.close. ");
}

//==== INIT FUNCTIONS ================================================

/*
 * RULE: the UI base ID for the Query Builder and tool button to call it 
 * MUST be the same.
 */
function initQueryBuilder() {
    console.log("DO initQueryBuilder ");
    var uig = "querybuilder";
    qb = new QueryBuilder("querybuilder");
    $("tool-querybuilder").onclick = function (e) {
        qb.open(aLayer.url);
    }
}

//==== EVENT HANDLERS =================================================

//--- On opening Query Builder list data layers of active map server 
function picklistLayers(mapLayer, sel) { //*** NOT USED **********
    console.log("DO picklistLayers: " + sel.id);
    var msid = mapLayer.id;
    var uig = sel.id.split("-")[0];
    var layerInfos = mapLayer.layerInfos;
    for (var layerInfo in layerInfos) {
        var lid = layerInfo.id;
        var vis = layerInfo.defaultVisibility;
        var name = layerInfo.name;
        var plid = layerInfo.parentLayerId;
        var sids = layerInfo.subLayerIds;
        if (sids.length == 0) {
            var urid = msid + ":" + lid;
            var url = mapLayer.url + "/" + lid;
            var opt = document.createElement("option");
            opt.id = uig + "-" + urid;
            opt.value = url;
            opt.text = name;
            sel.appendChild(opt);
        }
    }
}

/*
 * --- Create a Generic Picklist of Attribute Fields
 * @param {Array} fields: array of fields info in format from rest service json
 * @param {Object} sel: the select element to list the fields as options.
 * @param {String} fieldname: the layer displayField or other field to set as selected.
 * CALLER: QueryBuilder.getFields/callback
 */
function picklistFields(fields, sel, fieldname) {
    console.log("DO picklistFields: (" + fields.length + ") in " + sel.id);
	sel.length = 0;
    for (var i = 0; i < fields.length; i++) {
        var name = fields[i].name;
        var type = fields[i].type;
        var alias = fields[i].alias;
        var domain = fields[i].domain;
        if (fieldSkipList.indexOf("|" + name + "|") < 0) {
            var opt = document.createElement("option");
            opt.id = sel.id + ":" + i;
            opt.value = name;
            opt.innerHTML = alias;
            opt.title = type;
            if (fieldname != undefined
			 && fieldname.toUpperCase() == name.toUpperCase()) {
                opt.selected = true;
            }
            sel.appendChild(opt);
        }
    }
    // picklist events are handled on the select element level
}//DONE picklistFields

//--- Create a Generic Picklist of Data Values from Query Result
function picklistValues(features, fieldname, sel) { //*** NOT USED **********
    console.log("DO picklistValues: (" + features.length + ") in " + sel.id);
    sel.length = 0;
    for (var i = 0; i < fields.length; i++) {
        var name = fields[i].name;
        var type = fields[i].type;
        var alias = fields[i].alias;
        var domain = fields[i].domain;
        if (fieldSkipList.indexOf("|" + name + "|") < 0) {
            var opt = document.createElement("option");
            opt.id = sel.id + ":" + i;
            opt.value = name;
            opt.innerHTML = alias;
            opt.title = type;
            sel.appendChild(opt);
        }
    }
    
    var callback = function (json) {
        console.log("DO query builder fields picklist onchange action");
        console.log("Query for list of field values:<br />" + JSON.stringify(json));
    }
    sel.onchange = function (e) {
        console.log("Picked " + sel.options[sel.selectedIndex].value);
        //var fieldname = sel.options[sel.selectedIndex].value;
        //queryListOfValues(fieldname, aLayerUrl, callback);//@queryfun.js
    }
}
/*
 * --- Create a list of checkboxes of field names
 * for the target object (query builder) in designated container.
 * @param {Array} fields: field info from feature layer JSON.
 * @param {Object} target: an app object like a query builder instance. 
 * @param {String} fieldname: if arg included check the field checkbox.
 * Skip OBJECTID since auto included in query output fields.
 */
function checklistFields(fields, target, fieldname) {
	console.log("DO checklistFields: (" + fields.length + ") ");
	var checklist = target.checklist;//defined in QueryBuilder class
    //checklist.innerHTML = "";//=FAIL
    //while (colchklist.firstChild) {
    //    colchklist.removeChild(colchklist.firstChild);
    //}//=FAIL
	while (checklist.childNodes[0]) {
        console.log("REMOVING " + checklist.childNodes[0]);
        var junknode = checklist.removeChild(checklist.childNodes[0]);
    }
    var div = document.createElement("div");
    checklist.appendChild(div);
	var outFields = target.outFields;
    for (var i = 0; i < fields.length; i++) {
        var name = fields[i].name;
        var type = fields[i].type;
        var alias = fields[i].alias;
        if (fieldSkipList.indexOf("|" + name + "|") < 0 && name.toUpperCase() != "OBJECTID") {
			var liner = document.createElement("div");
			liner.className = "checklist";
            var checker = document.createElement("input");
			checker.type = "checkbox";
            checker.id = div.id + ":" + i;
            checker.value = name;
			checker.name = div.id.split("-")[0] + "-outfields";
            if (fieldname != undefined
             && fieldname.toUpperCase() == name.toUpperCase()) {
                checker.checked = true;
            }
			checker.style.marginRight = "5px";
            //div.appendChild(checker);
			//div.appendChild(document.createTextNode("\u0020"));
            liner.appendChild(checker);
			var labeler = document.createElement("label");
			labeler.id = div.id + ":" + i + "-label";
			labeler.setAttribute("for", checker.id);
			labeler.innerHTML = name + " (" + alias + ")";
			labeler.title = type;
			//div.appendChild(labeler);
			//div.appendChild(document.createElement("br"));
			liner.appendChild(labeler);
			div.appendChild(liner);
			checker.onclick = function (e) {
                //alert("CLICKED " + targetId(e).id);//=undefined?
				//alert("CLICKED " + checker.value);//=FAIL, always final item
				//console.log("CLICKED " + this.id);//=OK
				//alert(this.value + " is " + (this.checked ? "checked" : "unchecked"));//=OK
				if (this.checked) {
					outFields.push(this.value);
				} else {
					outFields.splice(outFields.indexOf(this.value), 1);
				}
				console.log("Query builder outFields= " + target.outFields);
                aLayer.outFields = target.outFields;
			}
        }
    }
}

//==== APPLICATION MODEL & RULES ============================================
/*
* ---- Parse an ArcGIS Server REST URL string into JSON of resource info.
* @param {String} url: REST URL to a feature layer under a map service 
* xxreturn {Array} [host, mapFolder, mapId, mapType, layerId]
* @return {Object} urlson: URL parts interpretation in JSON.
*/
function layerUrlParson(url) {
    console.log("DO layerUrlParson: " + url);
    var paths = url.split("/rest/services/");
    var hoster = paths[0].split("//")[1].split("/")[0]; //like 'sampleserver1.arcgisonline.com'
    var urlson = {
        host: hoster,
        mapFolder: null,
        mapId: null,
        mapType: null,
        layerId: -1,
        urid: null
    }
    var parts = paths[1].split("/"); //like ['Demographics','ESRI_Census_USA','MapServer','3']
    if (parts[1].indexOf("Server") > 0) {
        //return [parts[0], parts[1], parts[2]];
        urlson["mapId"] = parts[0];
        urlson["mapType"] = parts[1];
        if (parts[2] != undefined && parts[2] != "") {
            urlson["layerId"] = parseInt(parts[2]);
        }
    } else if (parts[2].indexOf("Server") > 0) {
        //return [parts[1], parts[2], parts[3]];
        urlson.mapFolder = parts[0];
        urlson.mapId = parts[1];
        urlson.mapType = parts[2];
        if (parts[3] != undefined && parts[3] != "") {
            urlson.layerId = parseInt(parts[3]);
        }
    }
    if (urlson.layerId == -1) {
        urlson.urid = urlson.mapId;
    } else {
        urlson.urid = urlson.mapId + ":" + urlson.layerId;
    }
    return urlson;
}


//==== AJAX ===========================================
/*
* ---- Esri Request Call Wrapper 
* @param {String} url: the REST resource to get data from.
* @param {Object} paramson: parameters in JSON.
* @param {String} format: return data format - 'json'|'text'|'xml'
* @param {Object} callback: ref to a function to handle response.
* REQ: Proxy page setup for XSS call
* @return {void}: asynchronously executes callback on data response.
*/
function esrequest(url, paramson, format, callback) {
    console.log("DO esrequest: " + url);
    var reqson = {
        url: url,
        content: paramson,
        handleAs: format
    }
    var request = esri.request(reqson);
    request.then(callback, callbackFailed);
}

function callbackFailed(error) {
    console.log("Error: ", error.message);
    //alert(error.message);
    //console.log("DO callbackFailed: ERROR: " + error.message);
}


//++++++++++++++++++++++++++++++ SAMPLE +++++++++++++++++++++++++++++++++
/* --- Sample Esri Request Ajax Object ---
var request = esri.request({
    // Location of the data
    url: aMapServerUrl,
    // Service parameters if required, sent with URL as key/value pairs
    content: {
        //token: "XYZ",
        f: "json"
    },
    // Data format
    handleAs: "json"
});

function requestSucceeded(data) {
    console.log("Data: ", data); // print the data to browser's console
}

function requestFailed(error) {
    console.log("Error: ", error.message);//=FAIL? Error:  Unexpected token '<'
}

request.then(requestSucceeded, requestFailed);

// Alternatively dynamically define callbacks
request.then(
  function (data) {
      console.log("Data: ", data);
  },
  function (error) {
      console.log("Error: ", error.message);
  }
);
*/
