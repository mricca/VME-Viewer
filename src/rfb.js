var myMap = false;

function getProjection(radioObj) {
    var radioObj = document.getElementsByName("srs");
	if(!radioObj)
		return "";
	var radioLength = radioObj.length;
	if(radioLength == undefined)
		if(radioObj.checked)
			return radioObj.value;
		else
			return "";
	for(var i = 0; i < radioLength; i++) {
		if(radioObj[i].checked) {
			return radioObj[i].value;
		}
	}
	return "";
}

function setProjection(newValue) {
    var radioObj =document.getElementsByName("srs");
	if(!radioObj)
		return;
	var radioLength = radioObj.length;
	if(radioLength == undefined) {
		radioObj.checked = (radioObj.value == newValue.toString());
		return;
	}
	for(var i = 0; i < radioLength; i++) {
		radioObj[i].checked = false;
		if(radioObj[i].value == newValue.toString()) {
			radioObj[i].checked = true;
		}
	}
}
function reset(){
	document.getElementById("FilterRFB").text = FigisMap.label('SELECT_AN_AREA');
	document.getElementById("FilterRFB").value = "";
	document.getElementById("SelectRFB").value = "";
	setProjection('4326');
	FigisMap.ol.clearPopupCache();
	setRFBPage('e-link','rfbs-link', 'rfbs-html');
    var years = Ext.getCmp('years-slider');	
    years.setValue(0, new Date().getFullYear());	
	Ext.getCmp('years-min-field').setValue(new Date().getFullYear());
	updateVme();	
	myMap.zoomToMaxExtent();
	// Ensure that rfb.js is included AFTER vmeData.js, so theese are initialized
	Vme.form.panels.SearchForm.getForm().reset();
	Vme.form.panels.SearchPanel.layout.setActiveItem('searchcard-0');
}

function updateVme(){

    Ext.getCmp('years-slider').disable();
    Ext.getCmp("year-min-largestep").disable(); 
    Ext.getCmp("year-min-littlestep").disable(); 
    Ext.getCmp("year-max-littlestep").disable(); 
    Ext.getCmp("year-max-largestep").disable();
    Ext.getCmp("last-year").disable(); 
    Ext.getCmp("first-year").disable(); 
    
    FigisMap.ol.clearPopupCache();
    FigisMap.ol.refreshFilters();
	 //remove layer for hilighting
	var hilayer = myMap.getLayersByName("highlight")[0];
	if(hilayer ){
		myMap.removeLayer(hilayer)
	}
   
   
}
/**
* function setZoom
*
**/
function setZoom() {
	var settings = FigisMap.ol.getSettings( document.getElementById("FilterRFB").value );
	//Close popup when RFB change
	FigisMap.ol.clearPopupCache();
	zoomTo(settings);
}

/**
* function zoomTo
*
**/
function zoomTo(settings,geom) {
	if (settings != null){
		var bbox = geom ? geom : OpenLayers.Bounds.fromString(settings.zoomExtent,false);
		var curr_proj = myMap.getProjection();
		var bboxproj = settings.srs || "EPSG:4326";
		
		//check 
		var projcode = curr_proj.split(":")[1];
		var valid = FigisMap.ol.checkValidBbox(projcode,settings);
		
		if(valid){
			if(geom){
				myMap.zoomToExtent(bbox);
			}else{
				bbox = bbox.clone().transform(
					new OpenLayers.Projection(bboxproj),
					new OpenLayers.Projection(curr_proj)
				);
				myMap.zoomToExtent(bbox);			
			}
		}else{
			var newproj =bboxproj.split(":")[1];
			setRFB(bbox, null, newproj, 'e-link','rfbs-link', 'rfbs-html');
			myMap.zoomToExtent(bbox);
			setProjection(newproj);
		
		}
    }else{
    	myMap.zoomToMaxExtent();
    }
}

/**
* function setRFB
*       extent -> The extent to zoom after the layer is rendered (optional).
*       zoom -> The zoom level of the map (optional).
*       mapProjection -> The map projection (optional).
*       elinkDiv -> The embed-link id  (optional if not using the embed link div).
*       urlLink -> The id of the url input field of the embed-link (optional if not using the embed link div).
*       htmlLink -> The id of the html input field of the embed-link (optional if not using the embed link div).
**/
function setRFB( extent, zoom, mapProjection, elinkDiv, urlLink, htmlLink,filter) {
	if ( ! mapProjection ) {
		var settings = FigisMap.rfb.getSettings( getProjection());
		setProjection(settings && settings.srs ? settings.srs : '4326');
	}
	//Close popup when RFB change
	FigisMap.ol.clearPopupCache();
	addRFB( extent, zoom, mapProjection, elinkDiv, urlLink, htmlLink,filter );
}

/**
* function addRFB
*       extent -> The extent to zoom after the layer is rendered (optional).
*       zoom -> The zoom level of the map (optional).
*       elinkDiv -> The embed-link id  (optional if not using the embed link div).
*       urlLink -> The id of the url input field of the embed-link (optional if not using the embed link div).
*       htmlLink -> The id of the html input field of the embed-link (optional if not using the embed link div).
**/
function addRFB(extent, zoom, projection, elinkDiv, urlLink, htmlLink,filter) {
	//sets the zoom dropdown to default values ​​when the area selection and the selection of projection change
		populateZoomAreaOptions('FilterRFB');
	
	var pars = {
		rfb		: document.getElementById("SelectRFB").value,
		target		: 'map',
		context		: 'rfbViewer',
		legend		: 'legend',
		projection	: projection/*,
		countriesLegend	: 'MemberCountries'*/
	};
    
    if ( zoom != null ) pars.zoom = zoom;

	/*if ( zoom != null ){
      pars.zoom = zoom;  
    }else{    
        switch(projection)
        {
            case '3031':
              pars.zoom = (pars.rfb == 'NEAFC') || (pars.rfb == 'NAFO') ? zoom : 1;
              break;
            case '54009':
              pars.zoom = (pars.rfb == 'NEAFC') || (pars.rfb == 'NAFO') ? zoom : 1;
              break;
            case '4326':
              pars.zoom = zoom;
              break;          
            case '3349':
              pars.zoom = (pars.rfb == 'NEAFC') || (pars.rfb == 'NAFO') ? zoom : 1;
              break;                    
            default:
              pars.zoom = (pars.rfb == 'CCAMLR') ? 1 : zoom;
        }
    }*/
	
	if ( extent != null ) pars.extent = extent;
	pars.filter = filter;
	
	if ( document.getElementById(elinkDiv) ) document.getElementById(elinkDiv).style.display = "none";
	
	myMap = FigisMap.draw( pars );
	
	if ( myMap ) {
		if ( document.getElementById(elinkDiv) ) {
			myMap.events.register(
				'moveend',
				this,
				function(){
					document.getElementById(elinkDiv).style.display = "none";
					document.getElementById(urlLink).value = "";
					document.getElementById(htmlLink).value = "";
				}
			);
		}
	
		var l = document.getElementById('legendLegendTitle');
		if ( l ) l.innerHTML = FigisMap.label( 'Legend', pars );
		l = document.getElementById('legendMembersTitle');
		if ( l ) {
			if ( document.getElementById('MemberCountries').innerHTML == '' ) {
				l.style.display = 'none';
			} else {
				l.innerHTML = FigisMap.label('List of Members');
				l.style.display = '';
			}
		}
		
		
	}
}

function populateRfbOptions(id) {
	var tgt = document.getElementById(id);
	var opt, e, cv = '';
	if ( tgt.options.length != 0 || tgt.value ) cv = tgt.value;
	var opts = new Array();
	var rfbs = FigisMap.rfb.list();
	for ( var i = 0; i < rfbs.length; i++ ) {
		opt = document.createElement('OPTION');
		opt.value = rfbs[i];
		opt.text = FigisMap.label( opt.value );
		opts.push( opt );
	}
	opt = document.createElement('OPTION');
	opt.text = FigisMap.label('SELECT_AN_RFB');
	opt.value = '';
	opt = new Array( opt );
	opts = opt.concat( opts.sort( function(a,b) { return a.text > b.text ? 1 : ( a.text < b.text ? -1 : 0 ); } ) );
	while ( tgt.options.length > 0 ) tgt.remove( 0 );
	for ( var i = 0; i < opts.length; i++ ) {
		try {
			tgt.add( opts[i], null );
		} catch(e) {
			tgt.add( opts[i] );
		}
	}
	tgt.value = cv;
}

function populateZoomAreaOptions(id) {
	var tgt = document.getElementById(id);
	var opt, e, cv = '';
	//if ( tgt.options.length != 0 || tgt.value ) cv = tgt.value;
	var opts = [];
	
	for ( var i in georeferences_data ) {
		opt = document.createElement('OPTION');
		opt.value = i;
		opt.text = FigisMap.label( opt.value );
		opts.push( opt );
	}
	opt = document.createElement('OPTION');
	opt.text = FigisMap.label('SELECT_AN_AREA');
	opt.value = '';
	opt = new Array( opt );
	opts = opt.concat( opts.sort( function(a,b) { return a.text > b.text ? 1 : ( a.text < b.text ? -1 : 0 ); } ) );
	while ( tgt.options.length > 0 ) tgt.remove( 0 );
	for ( var i = 0; i < opts.length; i++ ) {
		try {
			tgt.add( opts[i], null );
		} catch(e) {
			tgt.add( opts[i] );
		}
	}
	tgt.value = cv;
}

/*
* setRFBPage function. Load the base RFB Map applying the user request parameters, if any, to load the rfbs in to the map.  
*       elinkDiv -> The embed-link id  (optional if not using the embed link div).
*       urlLink -> The id of the url input field of the embed-link (optional if not using the embed link div).
*       htmlLink -> The id of the html input field of the embed-link (optional if not using the embed link div).
*/
function setRFBPage(elinkDiv, urlLink, htmlLink) {
	populateRfbOptions('SelectRFB');
	//sets the zoom dropdown to default values ​​when the area selection and the selection of projection change
	//populateZoomAreaOptions('FilterRFB');
	var layer, extent, zoom, prj;
	
	if ( location.search.indexOf("rfb=") != -1 ){
		
		// Parsing the request to get the parameters
		
		var params = location.search.replace(/^\?/,'').replace(/&amp;/g,'&').split("&");
		
		for (var j=0; j < params.length; j++) {
			var param = params[j].split("=");
			switch ( param[0] ) {
				case "rfb"	: layer = param[1]; break;
				case "extent"	: extent = param[1]; break;
				case "zoom"	: zoom = parseInt(param[1]); break;
				case "prj"	: prj = param[1]; break;
			}
		}
		
		if ( layer && layer != "" ) document.getElementById("SelectRFB").value = layer;
		
		if ( extent == "" ) extent = null;
		if ( extent != null ) {
			var bbox = extent.split(",");
			extent = new OpenLayers.Bounds(bbox[0], bbox[1], bbox[2], bbox[3]);
		}
		
		if ( zoom == '' ) zoom = null;
		if ( zoom != null ) zoom = parseInt( zoom );
		
		if ( prj == '' ) prj = null;
		setProjection( prj);
	}
	/*
	* Load the RFB using the request parameters.
	*/
	addRFB( extent, zoom, prj, elinkDiv, urlLink, htmlLink );
}

/*
* setRFBEmbedLink function. Manage the expand/collapse of the Embed-Link div.
*       targetId -> The embed-link div id.
*       specLinkId -> The id of the url input field of the embed-link.
*       specHtmlId -> The id of the html input field of the embed-link.
*/
function setRFBEmbedLink(targetId, rfbsLinkId, rfbsHtmlId) {
	
	if ( ! ( document.getElementById ) ) return void(0);
	
	var divId = document.getElementById(targetId);
	var linkId = document.getElementById(rfbsLinkId);
	var htmlId = document.getElementById(rfbsHtmlId);
	if (divId.style.display == "none" || divId.style.display == "") {
		/* 
		* Show the embed-link div
		*/
		divId.style.display = "block";
		var baseURL = location.href.replace(/#.*$/,'').replace(/\?.*$/,'');
		/*
		* Building the request url containing the map status.
		*/
		
		baseURL += "?rfb=" + document.getElementById("SelectRFB").value
			+ "&extent=" + myMap.getExtent().toBBOX()
			+ "&zoom=" + myMap.getZoom()
			+ "&prj=" + getProjection();
		/*
		* Setting the input fields of the embed-link div
		*/
		linkId.value = baseURL;
		
		var htmlFrame = '<iframe src ="' + baseURL.replace(/rfbs\.html/,'rfbs_e.html') + '" width="800" height="600" frameborder="0" marginheight="0">';
		htmlFrame += "</iframe>";
		
		htmlId.value = htmlFrame;
	} else {
		/*
		* Hide the embed-link div
		*/
		divId.style.display = "none";
		
		linkId.value = "";
		htmlId.value = "";
	}
}
