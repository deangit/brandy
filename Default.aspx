﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" Debug="true" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=7,IE=9" />
	<!--The viewport meta tag is used to improve the presentation and behavior of the samples 
	  on iOS devices-->
	<meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no" />
    <meta http-equiv="Expires" content="Mon, 22 Jul 2002 11:22:33 GMT" />
    <meta http-equiv="Cache-Control" content="No-Cache, no-store" />
    <meta http-equiv="Pragma" content="No-Cache" />
    <meta http-equiv="Version" content="v20130222" />
    <meta http-equiv="Keywords" content="California Fish and Wildlife" />
    <meta http-equiv="Description" content="ArcGIS Server Web Mapping JSAPI ASP.NET Application" />
    <title>ArcGIS Server JSAPI Web Mapping Application</title>
	<link rel="stylesheet" type="text/css" href="http://serverapi.arcgisonline.com/jsapi/arcgis/3.3/js/dojo/dijit/themes/claro/claro.css" />    
	<link rel="stylesheet" type="text/css" href="http://serverapi.arcgisonline.com/jsapi/arcgis/3.3/js/esri/css/esri.css" />
	<style type="text/css"> 
		html, body { height: 100%; width: 100%; margin: 0; padding: 0; overflow: hidden; }
	    /* center the image in the popup */
	    .esriViewPopup .gallery { margin: 0 auto !important; }
	</style>
	<link rel="stylesheet" type="text/css" href="css/app.css" />
	<script type="text/javascript">
	    //***REQUIRED if layout container not dijit type but plain html***
	    var djConfig = { parseOnLoad: true };
	</script>
	<!---
    <script type="text/javascript" src="https://serverapi.arcgisonline.com/jsapi/arcgis/3.3/"></script>
	<script type="text/javascript" src="https://www.google.com/jsapi"></script>
    -->
    <script type="text/javascript">
        var appPage = "Default.aspx";
        var contact = "biosgis@gmail.com";
        var docTitle = "Query Builder App";
        // Default body.onload function for ASP.NET Ajax
        function pageLoad() {
            window.defaultStatus = "CONTACT: " + contact;
            window.status = window.location.href + " loaded.";
            document.title = docTitle;
        }
        window.status = window.location.href + " is loading";
    </script>
</head>
<body class="claro">
	<a href="#" name=""></a>
    <form id="form1" runat="server">
        <asp:ScriptManager ID="ScriptManager1" runat="server" EnablePageMethods="true">
            <Scripts>
                <asp:ScriptReference Path="https://serverapi.arcgisonline.com/jsapi/arcgis/3.3/" />
                <asp:ScriptReference Path="https://www.google.com/jsapi" />
                <asp:ScriptReference Path="js/json2.js" />
                <asp:ScriptReference Path="js/app.js" />
                <asp:ScriptReference Path="js/init.js" />
            </Scripts>
        </asp:ScriptManager>
        <div></div>
    </form>

    <div id="topbar">
        <h2 id="app-title">
            USA County Demographics
        </h2>
        <input type="button" id="tools" value="Tools" class="button-view" />
        <div id="tools-view" style="display: none;">
            <input type="button" id="tool-querybuilder" value="Query Builder" />
            <br />
            <input type="button" id="tool-data" value="Data Table" />
            <br />
            <input type="button" id="tools-hide" value="X" class="button-hide" />
        </div>
    </div>

	<div id="map" style="border:1px solid #000;"></div>
    <div id="layer_list"></div>
	<div id="querybuilder" style="display: none;">
		<!--BEGIN QUERY BUILDER TOOL UI-->
        <label class="toolpanel-label">Active Layer:</label>
		<select id="querybuilder-layers" style="width: 70%;">
			<option value="">--PICK A TARGET LAYER--</option>
            <option id="querybuilder-mapId" value="" title="HIDDEN" style="display: none;"></option>
		</select>
        <table width="100%" border="0" cellspacing="1" cellpadding="5" style="margin-bottom: 5px;">
            <tr valign="top" style="height: 50%;">
                <td style="width: 30%;">
                    <label class="toolpanel-columnname">Fields</label><br />
                    <select id="querybuilder-fieldnames" class="toolpanel-select" size="6" title="Double click to select a field" style="width: 100%;">
                        <option value="">--PICK A FIELD--</option>
                        <option value="">LIST OF FIELD NAMES</option>
                    </select>
                </td>
                <td align="center" style="width: 30%;">
                    <label class="toolpanel-columnname">Operators</label><br />
                    <input type="button" id="querybuilder-lpar" class="button40px" value="(" title="Begin Parenthesis" />
                    <input type="button" id="querybuilder-rpar" class="button40px" value=")" title="Closing Parenthesis" />
                    <input type="button" id="querybuilder-not" class="button40px" value="NOT" title="Is Not" />
                    <br />
                    <input type="button" id="querybuilder-eq" class="button40px" value="=" title="Equal To" />
                    <input type="button" id="querybuilder-ne" class="button40px" value="<>" title="Not Equal To" />
                    <input type="button" id="querybuilder-like" class="button40px" value="LIKE" title="Like" />
                    <br />
                    <input type="button" id="querybuilder-gt" class="button40px" value="&gt;" title="Greater Than" />
                    <input type="button" id="querybuilder-gte" class="button40px" value="&gt;=" title="Greater Than Or Equal to" />
                    <input type="button" id="querybuilder-and" class="button40px" value="AND" title="And" />
                    <br />
                    <input type="button" id="querybuilder-lt" class="button40px" value="&lt;" title="Less Than" />
                    <input type="button" id="querybuilder-lte" class="button40px" value="&lt;=" title="Less Than or Equal to" />
                    <input type="button" id="querybuilder-or" class="button40px" value="OR" title="Or" />
                    <br />
                    <!--<input type="button" class="toolpanel-button" value="Blank" title="Blank ('')"'\'\'');" />-->
                    <input type="button" id="querybuilder-isnull" class="button40px" value="IsNull" title="Is Null" />
                    <input type="button" id="querybuilder-notnull" class="button50px" value="NotNull" title="Is Not Null" />
                    <input type="button" id="querybuilder-in" class="button30px" value="IN()" title="In" />
                </td>
                <td>
                    <input type="button" id="querybuilder-getvalues" class="toolpanel-button" title="Get Sample Values" value="List Some" />
                    <label class="toolpanel-label">Values</label><br />
                    <select id="querybuilder-fieldvalues" class="toolpanel-select" multiple="multiple" size="6" title="Double click to select a value" style="width: 100%;">
                        <option value="">--PICK VALUES--</option>
                        <option>LIST OF FIELD VALUES</option>
                        <option>(Limited to 1000 record values)</option>
                    </select>
                    <!--
                    <label class="toolpanel-columnname">Or Enter value/string:</label>
                    <input type="text" id="querybuilder-text" title="Manual entry value here" value="(number_or_'string')" style="width: 100%;" />
                    -->
                </td>
            </tr>
            <tr style="background-color: #DCDCDC;">
                <td colspan="3">
                    <label class="toolpanel-label">SELECT </label>
					<input type="button" id="querybuilder-cols" value="\x20\x2A\x20" />
                    <div id="querybuilder-columns" style="display: none;"></div>
                    <label class="toolpanel-label"> FROM </label>
					<label id="querybuilder-layername" class="active-layername">Active_Layer</label>
                    <label class="toolpanel-label"> WHERE </label>
                </td>
            </tr>
            <tr style="background-color: #DCDCDC;"><!-- height: 40%;-->
                <td align="center" colspan="3">
                    <!--TEXTAREA fits and auto-scroll better than DIV in IE, but must be READONLY-->
                    <textarea id="querybuilder-where" cols="50" rows="3" title="">
</textarea><!-- readonly="readonly"--><br />
                    <input type="button" id="querybuilder-clear" class="toolpanel-button" value="Clear"
                     title="Clear SQL Command below" />
                    <!-- onclick="queryFilterClear('querybuilder-where');"-->
                    <input type="button" id="querybuilder-undo" value="Undo"
                     title="Restore last SQL string" />
                </td>
            </tr>
            <tr id="query-modes">
                <td align="center" colspan="3">
                    <input type="radio" name="querybuilder-mode" value="queryNew" id="querybuilder-new" checked="checked" />
                    <label for="querybuilder-new">New Query</label>
                    <input type="radio" name="querybuilder-mode" value="queryMore" id="querybuilder-more" disabled="disabled" />
                    <label for="querybuilder-more" class="querybuilder-modes">Add to selection</label>
                    <input type="radio" name="querybuilder-mode" value="queryLess" id="querybuilder-less" disabled="disabled" />
                    <label for="querybuilder-less" class="querybuilder-modes">Query in selection</label>
                </td>
            </tr>
            <tr>
                <td align="center" colspan="3">
                    <input type="button" id="querybuilder-go" value="Execute Query" title="Query layer" />
                    <!--
					<input type="button" id="layerfilter-go" value="Apply Filter" title="Set Layer Definition Filter" />
                    <input type="button" id="filter-remove" value="Remove Filter" title="Remove Layer Definition Filter" style="display: none;" />
					-->
                    <input type="button" id="querybuilder-cancel" value="Cancel" title="Quit tool panel" />
                </td>
            </tr>
        </table>
        <!--END QUERY BUILDER TOOL UI-->
	</div>
    <div id="data-view" class="data-view-med">
        <div id="data-titlebar">
            <input type="button" id="tool-result" value="Tool Result" title="Tool result" class="button-view" />
            <span id="data-msg"></span>
        </div>
	    <div id="gtable_div"></div><%-- style="display: none;"--%>
        <input type="button" id="data-hide" class="button-hide" value="X" title="Close panel"
         onclick="hide('data-view')" />
    </div>
	<script type="text/javascript">
	    //alert(window.location.href + " has loaded");
	</script>
</body>
</html>
