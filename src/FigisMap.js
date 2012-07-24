/*
	Generalized map call facility
	Authors: M. Balestra, A. Fabiani, A. Gentile, T. Di Pisa.
	Status: Beta.
	Build: 20110310-001
*/

// if ( console == null ) var console = new Object();
// if ( ! console.log ) console.log = function(){};

var FigisMap = {
	parser		: new Object(), // parsing methods collection
	fs		: new Object(), // specific fact sheets methods collection
	rfb		: new Object(), // specific RFB methods collection
	rnd		: new Object(), // FigisMap.renderer specific collection of methods and variabes
	ol		: new Object(), // OpenLayers related utilities
	isDeveloper	: ( document.domain.indexOf( '192.168.' ) == 0 ),
	lastMap		: null,
	renderedMaps	: new Object(),
	isTesting	: ( (document.domain.indexOf('figis02')==0 ||document.domain.indexOf('193.43.36.238')==0||document.domain.indexOf('www-data.fao.org')==0) ),
	currentSiteURI	: location.href.replace(/^([^:]+:\/\/[^\/]+).*$/,"$1"),
	debugLevel	: 1 // 0|false|null: debug off, 1|true:console, 2: console + error alert
};

FigisMap.fifao = {
	cbs : 'fifao:country_bounds',
	cnt : 'fifao:UN_CONTINENT2',
	div : 'fifao:FAO_DIV',
	eez : 'fifao:EEZ',
	maj : 'fifao:FAO_MAJOR',
	ma2 : 'fifao:FAO_MAJOR2',
	nma : 'fifao:eez2',
	RFB : 'fifao:RFB',
	rfb : 'fifao:RFB_COMP',
	sdi : 'fifao:FAO_SUB_DIV',
	spd : 'fifao:SPECIES_DIST', 
	sub : 'fifao:FAO_SUB_AREA',
	vme : 'fifao:VME', 
	vme_fp : 'fifao:FOOTPRINTS',
    vme_en : 'fifao:Encounters',
    vme_sd : 'fifao:Surveydata'
};
 
FigisMap.defaults = {
	lang		: document.documentElement.getAttribute('lang') ? document.documentElement.getAttribute('lang').toLowerCase() : 'en',
	baseLayer	: { layer: FigisMap.fifao.cnt, cached: true, remote:true, label : "Continents" },//FigisMap.fifao.maj,
	basicsLayers	: true,
	context		: 'default',
	drawDataRect	: false,
	global		: false,
	landMask	: true,
	mapSize		: 'S',
	layerFilter	: '',
	layerStyle	: '*',
	layerStyles	: { distribution : 'all_fao_areas_style', intersecting : '*', associated : '*' }
};

FigisMap.useProxy = FigisMap.isDeveloper ? false : ( FigisMap.isTesting ? FigisMap.currentSiteURI.indexOf(':8484') < 1 : ( FigisMap.currentSiteURI.indexOf('http://www.fao.org') != 0 ) );

FigisMap.geoServerAbsBase = FigisMap.isDeveloper ? 'http://192.168.1.122:8484' : ( FigisMap.isTesting ? 'http://193.43.36.238:8484' : 'http://www.fao.org' );
FigisMap.geoServerBase = '';

FigisMap.httpBaseRoot = FigisMap.geoServerBase + ( FigisMap.isDeveloper ? '/figis/figis-vme/' : '/figis/figis-vme/' );

FigisMap.rnd.vars = {
	geoserverURL		: FigisMap.geoServerBase + "/figis/geoserver",
	geowebcacheURL		: FigisMap.geoServerBase + "/figis/geoserver/gwc/service",
	logoURL			: FigisMap.httpBaseRoot + "theme/img/FAO_blue_20_transp.gif",
	logoURLFirms		: FigisMap.httpBaseRoot + "theme/img/logoFirms60.gif",
	FAO_fishing_legendURL	: FigisMap.httpBaseRoot + "theme/img/FAO_fishing_legend.png",
	EEZ_legendURL		: FigisMap.httpBaseRoot + "theme/img/EEZ_legend.png",
	VME_legendURL		: FigisMap.httpBaseRoot + "theme/img/VME_legend.png",
	VME_FP_legendURL	: FigisMap.httpBaseRoot + "theme/img/VME_FP_legend.png",
	RFB_legendURL		: FigisMap.httpBaseRoot + "theme/img/RFB_legend.png",
	wms			: FigisMap.geoServerBase + "/figis/geoserver" + "/wms",
	gwc			: FigisMap.geoServerBase + "/figis/geoserver/gwc/service" + "/wms",
	remote:{
		wms: "http://figisapps.fao.org/figis/geoserver/wms",
		gwc: "http://figisapps.fao.org/figis/geoserver/gwc/service/wms"
	},
	Legend_Base_Request	: FigisMap.geoServerBase + "/figis/geoserver" + "/wms" + "?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&WIDTH=30&HEIGHT=20",
	wfs			: FigisMap.geoServerBase + '/figis/geoserver/wfs?request=GetFeature&version=1.0.0&typename=',
	absWfs			: FigisMap.geoServerAbsBase + '/figis/geoserver/wfs?request=GetFeature&version=1.0.0&typename='
};

if ( FigisMap.useProxy ) FigisMap.rnd.vars.wfs = FigisMap.currentSiteURI + '/figis/proxy/cgi-bin/proxy.cgi?url=' + escape( FigisMap.rnd.vars.absWfs );

/*document.write('<scr'+'ipt type="text/javascript" language="javascript" src="' + FigisMap.httpBaseRoot + 'proj4js/lib/proj4js-combined.js"></scr'+'ipt>');
document.write('<scr'+'ipt type="text/javascript" language="javascript" src="' + FigisMap.httpBaseRoot + 'proj4js/lib/defs/EPSG4326.js"></scr'+'ipt>');
document.write('<scr'+'ipt type="text/javascript" language="javascript" src="' + FigisMap.httpBaseRoot + 'proj4js/lib/defs/EPSG3031.js"></scr'+'ipt>');
document.write('<scr'+'ipt type="text/javascript" language="javascript" src="' + FigisMap.httpBaseRoot + 'proj4js/lib/defs/EPSG900913.js"></scr'+'ipt>');

document.write('<scr'+'ipt type="text/javascript" language="javascript" src="' + FigisMap.httpBaseRoot + 'src/OpenLayers.js"></scr'+'ipt>');
document.write('<scr'+'ipt type="text/javascript" language="javascript" src="' + FigisMap.httpBaseRoot + 'js/figis-data.js" charset="UTF-8"></scr'+'ipt>');*/

FigisMap.console = function( args, doAlert ) {
	var e;
	if ( doAlert == null ) doAlert = ( FigisMap.debugLevel && FigisMap.debugLevel > 1 );
	try {
		args.length;
		args.join;
	} catch( e ) {
		args = [ args ];
	}
	try {
		for ( var i = 0; i < args.length; i++ ) console.log( args[i] );
	} catch( e ) {
		if ( doAlert ) {
			var txt = '';
			for ( var i = 0; i < args.length; i++ ) {
				txt += args[i] + "\r\n";
				if ( args[i].message ) txt += args[i].message + "\r\n";
			}
			alert( txt );
		}
	}
}

FigisMap.debug = function() {
	if ( FigisMap.debugLevel ) {
		var args = new Array(' --- debug information --- ');
		for ( var i = 0; i < arguments.length; i++ ) args.push( arguments[i] );
		FigisMap.console( args )
	};
}

FigisMap.error = function() {
	var args = new Array(' --- error information --- ');
	for ( var i = 0; i < arguments.length; i++ ) args.push( arguments[i] );
	FigisMap.console( args, (FigisMap.isTesting || FigisMap.isDeveloper) );
}

FigisMap.label = function( label, p ) {
	var lang = p && p.lang ? p.lang : ( FigisMap.lang ? FigisMap.lang : FigisMap.defaults.lang );
	if ( ! label ) return '';
	var l = label.toUpperCase();
	if ( p && p.staticLabels && p.staticLabels[l] ) {
		switch ( typeof p.staticLabels[l] ) {
			case 'string'	: return p.staticLabels[l]; break;
			case 'object'	: return p.staticLabels[l][lang] ? p.staticLabels[l][lang] : p.staticLabels[l][FigisMap.defaults.lang]; break;
		}
	}
	if ( staticLabels && staticLabels[l] ) {
		switch ( typeof staticLabels[l] ) {
			case 'string'	: return staticLabels[l]; break;
			case 'object'	: return staticLabels[l][lang] ? staticLabels[l][lang] : staticLabels[l][FigisMap.defaults.lang]; break;
		}
	}
	return label;
}

FigisMap.isFaoArea = function( layerName ) {
	switch ( layerName ) {
		case FigisMap.fifao.maj : return true; break;
		case FigisMap.fifao.ma2 : return true; break;
		case FigisMap.fifao.div : return true; break;
		case FigisMap.fifao.sdi : return true; break;
		case FigisMap.fifao.sub : return true; break;
		default	 : return false;
	}
};

FigisMap.ol.reBound = function( proj0, proj1, bounds ) {
	proj0 = parseInt( String( proj0.projCode ? proj0.projCode : proj0 ).replace(/^EPSG:/,'') );
	proj1 = parseInt( String( proj1.projCode ? proj1.projCode : proj1 ).replace(/^EPSG:/,'') );
	if ( bounds == null ) {
		proj0 = 4326;
		bounds = new OpenLayers.Bounds(-180, -90, 180, 90);
	}
	var ans = false;
	if ( proj0 == 3349 ) proj0 = 900913;
	if ( proj1 == 3349 ) proj1 = 900913;
	if ( proj0 == proj1 ) ans = bounds;
	if ( proj1 == 3031 ) return new OpenLayers.Bounds(-12400000,-12400000, 12400000,12400000);
	if ( ! ans ) {
		var source = new Proj4js.Proj( 'EPSG:' + proj0 );
		var dest   = new Proj4js.Proj( 'EPSG:' + proj1 );
		
		var min = new OpenLayers.Geometry.Point(bounds.left, bounds.bottom);
		var max = new OpenLayers.Geometry.Point(bounds.right, bounds.top);
		var minpt = Proj4js.transform(source, dest, min);
		var maxpt = Proj4js.transform(source, dest, max);
		ans = new OpenLayers.Bounds(minpt.x, minpt.y, maxpt.x, maxpt.y);
	}
	if ( proj1 == 4326 ) ans = FigisMap.ol.dateline( ans );
	return ans;
};
FigisMap.ol.dateline = function( b ) {
	if ( b.left < 0 && b.right > 0 && ( b.right - b.left ) < 300  ) {
		// do nothing
	} else {
		if ( b.left < 0 ) b.left += 360;
		if ( b.right < 0 ) b.right += 360;
		if ( b.left > b.right ) {
			var t = b.left;
			b.left = b.right;
			b.right = t;
		} else {
			var diff = b.right - b.left;
			if ( ( diff > 300 ) && ( diff < 360 ) ) {
				var t = b.left;
				b.left = b.right -360;
				b.right = t;
			}
		}
	}
	return b;
};
FigisMap.ol.reCenter = function( proj0, proj1, center ) {
	proj0 = parseInt( String( proj0.projCode ? proj0.projCode : proj0 ).replace(/^EPSG:/,'') );
	proj1 = parseInt( String( proj1.projCode ? proj1.projCode : proj1 ).replace(/^EPSG:/,'') );
	if ( proj0 == 3349 ) proj0 = 900913;
	if ( proj1 == 3349 ) proj1 = 900913;
	if ( center == null ) {
		if ( proj1 == 900913 ) return new OpenLayers.LonLat(20037508.34, 4226661.92);
		proj0 = 4326;
		center = new OpenLayers.LonLat( 0, 0 );
	}
	if ( proj0 == proj1 ) return center;
	if ( proj1 == 3031 ) return new OpenLayers.LonLat(156250.0, 703256.0);
	var newCenter;
	var source = new Proj4js.Proj( 'EPSG:' + proj0 );
	var dest   = new Proj4js.Proj( 'EPSG:' + proj1 );
	
	var centerPoint = new OpenLayers.Geometry.Point( center.lon, center.lat );
	var newCenterPoint = Proj4js.transform(source, dest, centerPoint);
	return new OpenLayers.LonLat( newCenterPoint.x, newCenterPoint.y );
};

FigisMap.ol.extend = function( bounds1, bounds2 ) {
	var b1 = { left: bounds1.left, bottom: bounds1.bottom, right: bounds1.right, top: bounds1.top };
	var b2 = { left: bounds2.left, bottom: bounds2.bottom, right: bounds2.right, top: bounds2.top };
// 	if ( b1.left < 0 ) b1.left += 360;
// 	if ( b1.right < 0 ) b1.right += 360;
// 	if ( b2.left < 0 ) b2.left += 360;
// 	if ( b2.right < 0 ) b2.right += 360;
	if ( b1.left > b2.left ) b1.left = b2.left;
	if ( b1.bottom > b2.bottom ) b1.bottom = b2.bottom;
	if ( b1.right < b2.right ) b1.right = b2.right;
	if ( b1.top < b2.top ) b1.top = b2.top;
	if ( b1.left > b1.right ) {
		b2 = b1.right;
		b1.right = b1.left;
		b1.left = b2;
	}
	return FigisMap.ol.dateline( new OpenLayers.Bounds( b1.left, b1.bottom, b1.right, b1.top ) );
};
FigisMap.ol.gmlBbox = function( xmlDoc ) {
	var e;
	try {
		var g = new OpenLayers.Format.GML();
		var feat = g.read( xmlDoc );
		var b;
		for ( var i = 0; i < feat.length; i++ ) {
			if ( i == 0) {
				b = FigisMap.ol.dateline( feat[i].bounds );
			} else {
				b = FigisMap.ol.extend( b, feat[i].bounds );
			}
		}
		return b;
	} catch(e) {
		FigisMap.debug('FigisMap.ol.gmlBbox exception:', e, e.message, 'XML document:',xmlDoc );
		return false;
	}
};
/*
FigisMap.ol.gmlBbox = function( xmlDoc ) {
	var cnode, e;
	try {
		cnode = xmlDoc.documentElement.getElementsByTagName('boundedBy')[0].getElementsByTagName('Box')[0].getElementsByTagName('coordinates')[0];
	} catch( e ) {
		try {
			cnode = xmlDoc.documentElement.getElementsByTagNameNS('*','boundedBy')[0].getElementsByTagNameNS('*','Box')[0].getElementsByTagNameNS('*','coordinates')[0];
		} catch(e) {
			cnode = false;
		}
	}
	if ( cnode ) {
		var ctext = cnode.firstChild.nodeValue.split(' ');
		var lbrt = ctext[0].split(cnode.getAttribute('cs')).concat( ctext[1].split(cnode.getAttribute('cs')) );
		for ( var i = 0; i < 4; i++ ) lbrt[i] = parseFloat( lbrt[i].split( cnode.getAttribute('decimal') ).join('.') );
		return new OpenLayers.Bounds( lbrt[0], lbrt[1], lbrt[2], lbrt[3] );
	} else {
		try {
			var g = new OpenLayers.Format.GML();
			var feat = g.read( xmlDoc );
			if ( ! feat && feat[0] && feat[0].bounds ) return false;
			var bounds = feat[0].bounds;
			for ( var i = 1; i < feat.length; i++ ) if ( feat[i].bounds) bounds.extend( feat[i].bounds );
			return bounds;
		} catch(e) {
			FigisMap.debug('FigisMap.ol.gmlBbox exception:', e, e.message, 'XML document:',xmlDoc );
			return false;
		}
	}
};
*/

FigisMap.parser.layer = function( obj, setProperties ) {
	if ( typeof ( obj ) == 'string' ) obj = { 'layer' : String( obj ) };
	if ( typeof setProperties == 'object' ) for ( var i in setProperties ) obj[i] = setProperties[i];
	switch ( typeof ( obj.filter ) ) {
		case 'string'		: break;
		case 'object'		: obj.filter = obj.filter.join(' OR '); break;
		default			: obj.filter = FigisMap.defaults.layerFilter;
	}
	if ( ! obj.style ) switch ( obj.type ) {
		case 'base'	: break;
		default		: obj.style = FigisMap.defaults.layerStyle;
	}
	return obj;
};

FigisMap.parser.layers = function( obj, setProperties ) {
	if ( typeof obj == 'undefined' || typeof obj == 'boolean' ) return false;
	if (typeof obj == 'string') {
		if ( ( obj.indexOf('/') > -1 ) || ( obj.indexOf('-') > -1 ) ) {
			var v = obj.indexOf('/') > -1 ? obj.split('/') : new Array( String(obj) );
			obj = new Array();
			for ( var i = 0; i < v.length; i++ ) {
				var theLayer = String(v[i]);
				if ( theLayer != '' ) {
					if ( theLayer.indexOf('-') > -1 ) {
						var lf = theLayer.split('-');
						var l = { 'layer' : lf[0] };
						if ( lf[1] != '' ) l.filter = lf[1];
						obj[ obj.length ] = l;
					} else {
						obj[ obj.length ] = { 'layer' : theLayer };
					}
				}
			}
		} else {
			 obj = new Array( { 'layer' : String(obj) } );
		}
	} else if ( typeof ( obj.length ) == 'undefined' ) {
		obj = new Array( obj );
	}
	
	var ls = new Array();
	for ( var i = 0; i < obj.length; i++ ) {
		var l = FigisMap.parser.layer( obj[i], setProperties );
		if ( l.filter && l.filter.length > 150 && l.filter.indexOf(' OR ') > 0 ) {
			var fs = l.filter.split(' OR ');
			while ( fs.length > 0 ) {
				var newfs = fs.splice(0,50);
				var nl = new Object();
				for ( var p in l ) nl[p] = l[p];
				nl.filter = newfs.join(' OR ');
				if ( ls[0] ) nl.skipLegend = true;
				ls.push( nl );
			}
		} else {
			ls.push( l );
		}
	}
	
	return ls;
};

FigisMap.parser.layersHack = function( p ) {
	// if a layer in distribution already appears in intersecting, then a style is attributed by default
	/*
	if ( p.distribution && p.intersecting && ( ! p.skipStyles ) ) {
		for ( var i = 0; i < p.distribution.length; i++ ) {
			var l = p.distribution[i];
			var isInIntersecting = false;
			for ( var j = 0; j < p.intersecting.length; j++ ) if ( p.intersecting[j].layer == l.layer ) { isInIntersecting = true; break; }
			if ( isInIntersecting ) l.style = FigisMap.defaults.layerStyles[ l.type ];
		}
	}
	*/
	if ( p.distribution && ( ! p.skipStyles ) ) {
		for ( var i = 0; i < p.distribution.length; i++ ) {
			var l = p.distribution[i];
			if ( FigisMap.isFaoArea( l.layer ) ) l.style = FigisMap.defaults.layerStyles.distribution;
		}
	}
};

FigisMap.parser.div = function( d ) {
	if ( ! d ) return { 'div': false, 'id': false };
	if ( typeof d == 'string' ) {
		d = { 'div' : document.getElementById( d ), 'id' : String( d ) };
	} else if ( typeof d == 'object' ) {
		if ( typeof d.div == 'string' ) {
			d.id = String( d.div );
			d.div = document.getElementById( d.id );
		} else if ( ! ( d.div ) ) {
			d = { 'div' : d, 'id' : d.getAttribute('id') };
		}
	} else {
		return { 'div': false, 'id': false };
	}
	return ( !! d.div ) ? d : { 'div': false, 'id': false };
};

FigisMap.parser.projection = function( p ) {
	var proj = p.projection;
	if ( proj ) {
		proj = parseInt( proj );
	} else {
		if ( p.rfb && p.rfb == 'ICES' ) proj = 3349;
	}
	switch ( proj ) {
		case   3349	: break;
		case 900913	: break;
		case   3031	: break;
		default		: proj = 4326;
	}
	return proj;
};

FigisMap.parser.watermark = function( p ) {
	//if ( p && p.context.indexOf('FIRMS') == 0 ) return false;
	var w = { src: FigisMap.rnd.vars.logoURL, width: 60, height: 60, wclass: 'olPoweredBy', title:FigisMap.label('Powered by FIGIS',p) };
	if ( p && p.context.indexOf('FIRMS') == 0 ) {
		w.src = FigisMap.rnd.vars.logoURLFirms;
		w.width = 60;
		w.height = 29;
	};
	if ( p && p.watermark != null ) {
		if ( typeof p.watermark == 'object' ) {
			for ( var i in p.watermark ) w[i] = p.watermark[i];
		} else {
			w = p.watermark;
		}
	}
	return w;
};

FigisMap.parser.countries = function( p ) {
	var cnt = p.countries;
	var isRFB = ( p.rfb && p.rfb != '' );
	if ( ! cnt || ! cnt[0] ) cnt = false;
	if ( ! cnt && isRFB ) cnt = FigisMap.rfb.getCountries( p.rfb, p );
	if ( cnt && cnt.length > 0 ) {
		var newLayer = { layer: FigisMap.fifao.cbs };
		if ( isRFB ) newLayer.title = FigisMap.label('Members', p);
		var filters = new Array();
		for (var i=0; i < cnt.length; i++) filters.push( "ISO_"+ cnt[i].length + "='" + cnt[i] + "'" );
		newLayer.filter = filters.join(' OR ');
		var layerType = p.distribution ? 'associated' : 'distribution';
		newLayer.type = layerType;
		p[ layerType ] = FigisMap.parser.layers( p[ layerType ] );
		if ( ! p[ layerType ] ) p[ layerType ] = new Array();
		p[ layerType ].push( newLayer );
		p[ layerType ] = FigisMap.parser.layers( p[ layerType ], { type : layerType } );
	}
	return cnt;
};

FigisMap.parser.checkLayerTitles = function( layers, pars ) {
	if ( layers ) for (var i = 0; i < layers.length; i++) if ( layers[i].title == null ) {
		var t = '';
		if ( layers[i].type == 'intersecting' ) t += FigisMap.label( layers[i].type, pars );
		t += FigisMap.label( layers[i].layer.replace(/^[^:]+:(.+)/,"$1"), pars );
		layers[i].title = t;
	}
}

FigisMap.parser.parse = function( p ) {
	
	if ( typeof p != 'object' ) return { 'parserError' : 'Params object is missing - type: ' + ( typeof p ) };
	
	if ( ! p.context ) p.context = FigisMap.defaults.context;
	
	if ( typeof p.isFIGIS == 'undefined' ) p.isFIGIS = ( p.context.indexOf( 'Viewer' ) < 0 );
	if ( typeof p.isViewer == 'undefined' ) p.isViewer = ! p.isFIGIS;
	if ( typeof p.isRFB == 'undefined' ) p.isRFB = ( p.rfb != null );
	
	p.mapSize = ( typeof p.mapSize == 'string' ) ? p.mapSize.toUpperCase() : FigisMap.defaults.mapSize;
	p.lang = ( typeof p.lang == 'string' ) ? p.lang.toLowerCase() : FigisMap.defaults.lang;
	
	if ( typeof p.target == 'undefined' ) {
		p.parserError = "'target' mandatory param is undefined.";
		return p;
	}
	p.target = FigisMap.parser.div( p.target );
	if ( ! p.target.div ) {
		p.parserError = "target element not found in document";
		return p;
	}
	
	if ( ! p.base ) if ( FigisMap.defaults.baseLayer ) p.base = FigisMap.defaults.baseLayer;
	if ( p.base ) {
		p.base = FigisMap.parser.layer( p.base, { 'type' : 'base'} );
		if ( ! p.base.title ) p.base.title = FigisMap.label( p.base.label ? p.base.label : p.base.layer, p );
	}
	
	p.distribution = FigisMap.parser.layers( p.distribution, { 'type' : 'distribution'} );
	FigisMap.parser.checkLayerTitles( p.distribution, p );
	
	p.intersecting = FigisMap.parser.layers( p.intersecting, { 'type' : 'intersecting'} );
	FigisMap.parser.checkLayerTitles( p.intersecting, p );
	
	p.associated = FigisMap.parser.layers( p.associated, { 'type' : 'associated'} );
	FigisMap.parser.checkLayerTitles( p.associated, p );
	
	//p.countries = FigisMap.parser.countries( p );
	
	FigisMap.parser.layersHack( p );
	
// 	if ( ! p.distribution ) {
// 		p.parserError = "'distribution' mandatory parameter is missing or malformed.";
// 		return p;
// 	}
	
	if ( p.isFIGIS ) FigisMap.fs.parse( p );
	
	p.projection = FigisMap.parser.projection( p );
	
	if ( ! p.dataProj ) p.dataProj = p.extent ? p.projection : 4326;
	
	p.legend = FigisMap.parser.div( p.legend );
	
	p.countriesLegend = FigisMap.parser.div( p.countriesLegend );
	
	if ( p.legend.div || p.countriesLegend.div ) {
		 if ( typeof p.legendType == 'string' ) {
		 	p.legendType = p.legendType.toUpperCase();
		 } else {
		 	p.legendType = ( p.isRFB && ! p.isViewer ) ? 'D' : 'T';
		 	if ( p.isViewer || p.isRFB ) p.legendType += 'P';
		 }
	}
	
	p.watermark = FigisMap.parser.watermark( p );
	
	if ( p.landMask == null ) p.landMask = FigisMap.defaults.landMask;
	if ( p.global == null ) p.global = FigisMap.defaults.global;
	if ( p.basicsLayers == null ) p.basicsLayers = FigisMap.defaults.basicsLayers;
	if ( p.drawDataRect == null ) p.drawDataRect = FigisMap.defaults.drawDataRect;
	if ( location.search.indexOf('debugLevel=') > -1 ) {
		FigisMap.debugLevel = parseInt( location.search.replace(/^.*debugLevel=([0-9]+).*$/,"$1") );
		if ( isNaN( FigisMap.debugLevel ) || FigisMap.debugLevel == 0 ) FigisMap.debugLevel = false;
		p.debug = FigisMap.debugLevel;
	} else if ( p.debug == null ) {
		p.debug = FigisMap.debugLevel;
	}
	
	return p;
}

FigisMap.fs.parse = function( p ) {
	if ( ! p.staticLabels ) p.staticLabels = new Object();
	if ( ! p.RFBName ) if ( staticLabels['MEMBERS_FS'] && ! p.staticLabels['MEMBERS'] ) p.staticLabels['MEMBERS'] = staticLabels['MEMBERS_FS'];
	var hasdist = ( p.distribution[0] && typeof p.distribution[0] == 'object' );
	if ( hasdist ) {
		var autoZoom = false;
		var dtype = new Object();
		for ( var i = 0; i < p.distribution.length; i++ ) {
			var l = p.distribution[i];
			if ( l.autoZoom ) autoZoom = true;
			if ( ! dtype[ l.layer ] ) dtype[ l.layer ] = new Array();
			dtype[ l.layer ].push( i );
		}
		if ( p.associated ) for ( var i = 0; i < p.associated.length; i++ ) if ( p.associated[i].autoZoom ) autoZoom = true;
		if ( p.intersecting ) for ( var i = 0; i < p.intersecting.length; i++ ) if ( p.intersecting[i].autoZoom ) autoZoom = true;
		
		if ( ! autoZoom ) autoZoom = FigisMap.fs.setAutoZoom( p, dtype );
		
		if ( dtype[ FigisMap.fifao.eez ] ) FigisMap.fs.eezHack( p, dtype );
		
		if ( ! p.rfb ) FigisMap.fs.dsort( p, dtype );
	}
};

FigisMap.fs.setAutoZoom = function( p, dtype ) {
	var prio = false;
	if ( ! prio ) if ( dtype[ FigisMap.fifao.rfb ] ) prio = dtype[ FigisMap.fifao.rfb ][0];
	if ( ! prio ) if ( dtype[ FigisMap.fifao.eez ] ) prio = dtype[ FigisMap.fifao.eez ][0];
	if ( ! prio ) if ( dtype[ FigisMap.fifao.cbs ] ) prio = dtype[ FigisMap.fifao.cbs ][0];
	if ( ! prio ) if ( dtype[ FigisMap.fifao.maj ] ) prio = dtype[ FigisMap.fifao.maj ][0];
	if ( ! prio ) prio = 0;
	p.distribution[ prio ].autoZoom = true;
	return true;
};

FigisMap.fs.eezHack = function( p, dtype ) {
	// associate a countrybound to every eez, if any (and if not countrybounds)
	if ( dtype[ FigisMap.fifao.eez ] && ! dtype[ FigisMap.fifao.cbs ] ) {
		dtype[ FigisMap.fifao.cbs ] = new Array();
		if ( ! p.associated ) p.associated = new Array();
		for ( var i = 0; i < dtype[ FigisMap.fifao.eez ].length; i++ ) {
			var curLayer = p.distribution[ dtype[FigisMap.fifao.eez][i] ];
			var newLayer = new Object();
			for ( var k in curLayer ) {
				switch ( String( k ) ) {
					case 'autoZoom' : break;
					case 'title'	: break;
					case 'type'	: newLayer.type = 'associated'; break;
					case 'layer'	: newLayer.layer = FigisMap.fifao.cbs; break;
					case 'filter'	: newLayer.filter = curLayer.filter.replace( /ISO([0-9])_CODE/g, "ISO_$1"); break;
					default		: newLayer[ k ] = curLayer[ k ];
				}
			}
			p.associated.push( newLayer );
		}
	}
};

FigisMap.fs.dsort = function( p, dtype ) {
	if ( p.distribution && p.distribution[0] ) {
		var lowers = new Array();
		var highers = new Array();
		var inters = new Array();
		while ( p.distribution[0] ) {
			var l = p.distribution.shift();
			if ( l.layer == FigisMap.fifao.spd && p.context == 'FIRMS' ) {
				lowers.push( l );
			} else if ( l.layer == FigisMap.fifao.rfb && dtype[ FigisMap.fifao.div ] ) {
				lowers.push( l );
			} else if ( l.layer == FigisMap.fifao.cbs ) {
				highers.push( l );
			} else {
				inters.push( l );
			}
		}
		p.distribution = highers.concat( inters, lowers );
		p.distribution.reverse();
	}
};

FigisMap.rnd.maxResolution = function( proj, pars ) {
	proj = parseInt( proj );
	var size = String(pars.mapSize).toUpperCase();
	switch ( size ) {
		case 'XS': break; // width ≤ 280
		case 'S' : break; // width ≤ 400
		case 'M' : break; // width ≤ 640
		case 'L' : break; // width ≤ 810
		default  : size = FigisMap.defaults.mapSize;
	}
	var base, offset;
	if ( proj == 3031 ) {
		base = 48828.125;
		switch ( size ) {
			case 'XS'	: return base * 4; break;
			case 'S'	: return base * 2; break;
			case 'M'	: return base * 2; break;
			case 'L'	: return base;  break;
		}
	} else if ( proj == 900913 ) {
		base = 156543.03390625;
		switch ( size ) {
			case 'XS'	: return base; break;
			case 'S'	: return base / 2; break;
			case 'M'	: return base / 2; break;
			case 'L'	: return base / 4; break;
		}
	} else {
// 		base = 0.703125;
// 		offset = 0.1171875;
// 		switch ( size ) {
// 			case 'S'	: return ( base /2 + offset) * 2; break;
// 			case 'M'	: return base /2 + offset; break;
// 			case 'L'	: return base /2 + offset; break;
// 		}
		base = 1.40625;
		switch ( size ) {
			case 'XS'	: return base; break;
			case 'S'	: return base /2; break;
			case 'M'	: return base /4; break;
			case 'L'	: return base /4; break;
		}
	}
};

FigisMap.rnd.watermarkControl = function( map, pars ) {
	if ( ! pars.watermark ) return false;
	var poweredByControl = new OpenLayers.Control();
	OpenLayers.Util.extend(
		poweredByControl,
		{
			draw: function () {
				OpenLayers.Control.prototype.draw.apply(this, arguments);
				this.div.innerHTML = '<img' +
					( pars.watermark.src ? ' src="' + pars.watermark.src + '"' : '' ) +
					( pars.watermark.width ? ' width="' + pars.watermark.width + '"' : '' ) +
					( pars.watermark.height ? ' height="' + pars.watermark.height + '"' : '' ) +
					( pars.watermark.wclass ? ' class="' + pars.watermark.wclass + '"' : '' ) +
					( pars.watermark.id ? ' id="' + pars.watermark.id + '"' : '' ) +
					( pars.watermark.title ? ' title="' + pars.watermark.title + '"' : '' ) +
					( ( ! pars.watermark.noPos && pars.watermark.width && pars.watermark.height ) ? ( ' style="position:absolute;left:' + (this.map.size.w - pars.watermark.width - 5) + 'px;top:' + (this.map.size.h - pars.watermark.height - 5) + 'px;"' ) : '' ) +
					'/>';
				return this.div;
			}
		}
	);
	map.addControl(poweredByControl);
	return true;
};

FigisMap.rnd.mouseControl = function( map, pars ) {
	map.addControl(
		new OpenLayers.Control.MousePosition( {
			prefix		: "lon: ",
			separator	: ", lat: ",
			numDigits	: 2,
			granularity	: 1000,
			displayProjection : new OpenLayers.Projection("EPSG:4326")
		} )
	);
};

FigisMap.rnd.initLayers = function( pars ) {
	var input = new Array();
	var output = new Array();
	if ( pars.associated ) input = input.concat( pars.associated );
	if ( pars.intersecting ) input = input.concat( pars.intersecting );
	if ( pars.distribution ) input = input.concat( pars.distribution );
	for ( var i = 0; i < input.length; i++ ) {
		var l = input[i];
		if ( l.layer != '' && l.filter != '' ) {
			var nl = new Object();
			for ( var j in l ) nl[j] = l[j];
			if ( nl.rfb && nl.rfb != '' && ! nl.settings ) nl.settings = FigisMap.rfb.getSettings( nl.rfb )
			if ( nl.dispOrder == null && nl.filter.toLowerCase().indexOf("disporder") != -1 ) {
				nl.dispOrder = parseInt( l.filter.replace(/^.*DispOrder[^0-9]+([0-9]+).*$/i,"$1") );
				if ( isNaN( nl.dispOrder ) ) nl.dispOrder = false;
			}
			output.push( nl );
		}
	}
	return output;
};

FigisMap.rnd.addAutoLayers = function( layers, pars ) {
	var layerTypes = new Object();
	for ( var i = 0; i < layers.length; i++ ) layerTypes[ layers[i].layer ] = true;
	if ( pars.basicsLayers ) {
		//WMS SurveyData
		if ( ! layerTypes[ FigisMap.fifao.vme_sd ] ) {
			layers.unshift({
				layer	: FigisMap.fifao.vme_sd,
				label	: 'SurveyData',
				filter	:"YEAR = '1000'",
				//icon	: '<img src="' + FigisMap.rnd.vars.VME_FP_legendURL + '" width="30" height="20" />',
                skipLegend	: true,
				opacity	: 1.0,
				hidden	: true,
				type	: 'auto',
                dispOrder: 4,
				hideInSwitcher	: true
			});
		}
		//WMS Encounters
		if ( ! layerTypes[ FigisMap.fifao.vme_en ] ) {
			layers.unshift({
				layer	: FigisMap.fifao.vme_en,
				label	: 'Encounters',
				filter	:"YEAR = '1000'",
				//icon	: '<img src="' + FigisMap.rnd.vars.VME_FP_legendURL + '" width="30" height="20" />',
                skipLegend	: true,
				opacity	: 1.0,
				hidden	: true,
				type	: 'auto',
                dispOrder: 4,
				hideInSwitcher	: true
			});
		}
		//WMS Vme
		if ( ! layerTypes[ FigisMap.fifao.vme ] ) {
			layers.unshift({
				layer	: FigisMap.fifao.vme,
				label	: 'Established VME areas',
				filter	:"YEAR = '2012'",
				icon	: '<img src="' + FigisMap.rnd.vars.VME_legendURL + '" width="30" height="20" />',
				opacity	: 1.0,
				hidden	: pars.isFIGIS,
				type	: 'auto',
				hideInSwitcher	: true,
                dispOrder: 4,
				isMasked: false
			});
		}
		//WMS Footprints
		if ( ! layerTypes[ FigisMap.fifao.vme_fp ] ) {
			layers.unshift({
				layer	: FigisMap.fifao.vme_fp,
				label	: 'Footprints',
				filter	:'*',
				icon	: '<img src="' + FigisMap.rnd.vars.VME_FP_legendURL + '" width="30" height="20" />',
				opacity	: 1.0,
				hidden	: true,
				type	: 'auto',
                dispOrder: 4,
				hideInSwitcher	: false
			});
		}
        /*
		//WMS Area of competence
		if ( ! layerTypes[ FigisMap.fifao.rfb ] ) {
			layers.unshift({
				layer	: FigisMap.fifao.rfb,
				label	: 'RFB regulatory area in high-seas',
				filter	: "RFB = 'CCAMLR' OR RFB = 'NAFO' OR RFB = 'NEAFC'",
				icon	: '<img src="' + FigisMap.rnd.vars.RFB_legendURL + '" width="30" height="20" />',
				opacity	: 0.8,
				hidden	: false,
				type	: 'auto'
			});
		}
        */
		//WMS 200 nautical miles arcs
		if ( ! layerTypes[ FigisMap.fifao.nma ] ) {
			layers.unshift({
				layer	: FigisMap.fifao.nma,
				label	: '200 nautical miles arcs',
				filter	:'*',
				icon	: '<img src="' + FigisMap.rnd.vars.EEZ_legendURL + '" width="30" height="20" />',
				opacity	: 0.3,
				hidden	: pars.isFIGIS,
				remote  : true,
				type	: 'auto'
			});
		}
		//WMS FAO Areas
		if ( ! ( layerTypes[ FigisMap.fifao.ma2 ] || layerTypes[ FigisMap.fifao.maj ] ) ) {
			layers.unshift( {
				layer	: FigisMap.fifao.ma2,
				label	: 'FAO fishing areas',
				filter	:'*',
				remote  : true, 
				icon	:'<img src="'+FigisMap.rnd.vars.FAO_fishing_legendURL+'" width="30" height="20" />',
				type	:'auto'
			} );
		}
	}
	if ( pars.landMask && ! layerTypes[ FigisMap.fifao.cnt ] ) {
		layers.push( {
			layer		: FigisMap.fifao.cnt,
			filter		: '*',
			type		: 'auto',
			style		: '*',
			remote		: true,
			skipLegend	: true,
			hideInSwitcher	: true
		} );
	}
    
	return layers;
};

FigisMap.rnd.sort4map = function( layers, p ) {
	var normalLayers = new Array();
	var higherLayers = new Array();
	var frontLayers = new Array();
	var countryLayers = new Array();
	
	for (var i = 0; i < layers.length; ++i) {
		var l = layers[i];
		if ( l.layer == FigisMap.fifao.cbs ) {
			countryLayers.push( l );
		} else if ( l.dispOrder && l.dispOrder > 1 ) {
			if ( l.settings && ! l.settings.isMasked ) {
				frontLayers.push( l );
			} else {
				higherLayers.push( l );
			}
		} else {
			normalLayers.push( l );
		}
	}
	return normalLayers.concat( higherLayers, frontLayers, countryLayers );
};

FigisMap.rnd.sort4legend = function( layers, p ) {
	var ans = new Array();
	var ord = [
		{ type:'distribution', label:'Main layers' },
		{ type:'associated', label:'Associated layers' },
		{ type:'intersecting', label:'Intersecting layers' },
		{ type:'auto', label:'Base layers' }
	];
	for ( var i = 0; i < ord.length; i++ ) {
		var div = new Array();
		for ( var j = 0; j < layers.length; j++ ) if ( layers[j].type == ord[i].type ) div.push( layers[j] );
		if ( div.length != 0 ) {
			ans.push( { division: ord[i].type, start: true, label: ord[i].label } );
			ans = ans.concat( div );
			ans.push( { division: ord[i].type, end: true, label: ord[i].label } );
		}
	}
	return ans;
};

FigisMap.rnd.legend = function( layers, pars ) {
	if ( pars.legend.div ) pars.legend.div.innerHTML = FigisMap.rnd.mainLegend( layers, pars );
	if ( pars.countriesLegend.div ) pars.countriesLegend.div.innerHTML = FigisMap.rnd.countriesLegend( pars );
};

FigisMap.rnd.mainLegend = function( layers, pars ) {
	var LegendHTML = "";
	var hasFaoAreas = false;
	var legendDispLayers = new Object();
	var useTables = ( pars.legendType.indexOf('T') != -1 );
	var useSections = ( pars.legendType.indexOf('P') < 0 );
	var llayers = FigisMap.rnd.sort4legend( layers, pars );
	if ( useTables && ! useSections ) LegendHTML += '<table cellpadding="0" cellspacing="0" border="0">';
	for (var i = 0; i < llayers.length; i++) {
		var l = llayers[ i ];
		if ( useSections && l.division ) {
			if ( l.start ) {
				LegendHTML += '<div class="legendSection legendSection-' + l.type + '">' +
					'<div class="legendSectionTitle">' + FigisMap.label( l.label, pars ) + '</div>' +
					'<div class="legendSectionContent">';
				if ( useTables ) LegendHTML += '<table cellpadding="0" cellspacing="0" border="0">';
			} else if ( l.end ) {
				if ( useTables ) LegendHTML += '</table>';
				LegendHTML += '</div></div>';
			}
		}
		if ( ! l.layer || ! l.inMap || l.skipLegend ) continue;
		var wms_name = "";
		if ( l.type != 'intersecting' && l.type != 'auto' && FigisMap.isFaoArea( l.layer ) ) {
			if ( hasFaoAreas ) continue;
			wms_name = FigisMap.label( 'All FAO areas', pars );
			hasFaoAreas = true;
		}
		var STYLE = ( l.style && l.style != '*' ) ? l.style : null;
		
		if ( wms_name == '' && ! l.skipTitle ) wms_name = l.title != null ? l.title : l.wms.name;
		if ( l.dispOrder ) {
			var k = l.layer + '-' + ( STYLE ? STYLE.replace(/^rfb_.*$/,"*") : '*' );
			if ( legendDispLayers[ k ] ) continue;
			wms_name = wms_name.replace(/ \([^\)]+\).*$/,'');
			legendDispLayers[ k ] = true;
		}
		if ( ! l.icon ) {
			if ( ! l.iconSrc ) l.iconSrc = FigisMap.rnd.vars.Legend_Base_Request + "&LAYER=" + l.wms.params.LAYERS + "&STYLE=" + (STYLE != null ? STYLE : "");
			l.icon = '<img src="' + l.iconSrc +'"' + ( l.iconWidth ? ' width="' + l.iconWidth + '"' : '' ) + ( l.iconHeight ? ' height="' + l.iconHeight + '"' : '') + '/>';
		}
		if ( useTables ) {
			if( l.layer == FigisMap.fifao.spd ) {
				LegendHTML += '<tr><td colspan="2"><b>' + wms_name + '</b></td></tr>';
				LegendHTML += '<tr><td colspan="2">' + l.icon + '</td></tr>';
			} else if ( l.skipTitle || wms_name == '' ) {
				LegendHTML += '<tr><td colspan="2">' + l.icon + '</td></tr>';
			} else {
				LegendHTML += '<tr><td>' + l.icon + '</td><td><span>' + wms_name + '</span></td></tr>';
			}
		} else {
			if( l.layer == FigisMap.fifao.spd ) {
				LegendHTML += '<div><b>'+wms_name+'</b></div>';
				LegendHTML += '<div>' + l.icon + '</div></div>';
			} else {
				LegendHTML += '<div>' + l.icon;
				if ( wms_name != '' && ! l.skipTitle ) LegendHTML += '<span>' + wms_name + '</span>';
				LegendHTML += '</div>';
			}
		}
		l.inLegend = true;
	}
	if ( useTables && ! useSections ) LegendHTML += '</table>';
	return LegendHTML;
};

FigisMap.rnd.countriesLegend = function( pars ) {
	var ans = '';
	var cList = pars.countries;
	var layerName = pars.rfb && pars.rfb != '' ? pars.rfb : false;
	if ( ! cList && layerName ) cList = FigisMap.rfb.getCountries( layerName );
	if ( cList != undefined && cList.length > 0 ) {
		var cLabels = new Array();
		var c, prefix;
		for (var i = 0; i < cList.length; i++) {
			c = cList[i];
			switch ( c.length ) {
				case 3	: prefix = 'COUNTRY_ISO3_'; break;
				case 2	: prefix = 'COUNTRY_ISO2_'; break;
				default	: prefix = 'COUNTRY_';
			}
			var label = FigisMap.label( prefix + c, pars );
			if ( label.indexOf( prefix ) != 0 ) cLabels.push( label );
		}
		cLabels.sort();
		for ( var i = 0; i < cLabels.length; i++ ) ans += '<div>' + cLabels[i] + '</div>';
	}
	if ( layerName ) {
		var noteLabel = FigisMap.label('LEGEND_NOTE_' + layerName, pars );
		if ( noteLabel.indexOf('LEGEND_NOTE_') != 0 ) ans += '<div>' + noteLabel + '</div>';
	}
	return ans;
};

FigisMap.rfb.list = function() {
	var ans = new Array();
	if ( rfbLayerSettings ) for ( var i in rfbLayerSettings ) if ( ! rfbLayerSettings[i].skip ) ans.push( i );
	return ans;
};

FigisMap.rfb.getSettings = function( rfb, pars ) {
	if ( pars && ! ( pars.isViewer || pars.rfb )  ) return null;
	var v = rfbLayerSettings[ rfb ];
	if ( ! v ) return null;
	v.name = rfb;
	return v;
};

FigisMap.rfb.getDescriptor = function( layerName, pars ) {
	if ( ! rfbLayerDescriptors ) return '';
	var ldn = layerName.replace(/[' ]/g,'');
	var ld = rfbLayerDescriptors[ldn];
	if ( ! ld ) return '';
	if ( typeof ld == 'string' ) return ld;
	var title = ld.label ? FigisMap.label( ld.label, pars ) : ld.title;
	if ( ld.link ) return '<a href="' + ld.link + '" title="' + title + '" target="_blank"><b>' + title + '</b></a>';
	if ( title ) return '<b>'+ title + '</b>';
	return '';
}

FigisMap.rfb.getCountries = function( layerName ) {
	if ( ! rfbLayerCountries ) return null;
	layerName = layerName.replace(/[' ]/g,'').toUpperCase();
	if ( layerName.indexOf("_DEP") > 0) layerName = layerName.replace(/_DEP$/,'');
	return rfbLayerCountries[ layerName ];
}

FigisMap.rfb.preparse = function( pars ) {
	if ( pars.rfbPreparsed || pars.rfb == null ) return false;
	pars.distribution = FigisMap.parser.layers( pars.distribution );
	if ( ! pars.distribution ) pars.distribution = new Array();
	var sett = FigisMap.rfb.getSettings( pars.rfb );
	if ( sett ) {
		var type = new Object();
		if ( ! sett.type ) sett.type = 'MI';
		type.m = ( sett.type.toLowerCase().indexOf('m') != -1 );
		type.i = ( sett.type.toLowerCase().indexOf('i') != -1 );
		type.r = ( sett.type.toLowerCase().indexOf('r') != -1 );
		type.a = ( sett.type.toLowerCase().indexOf('a') != -1 );
		var title = FigisMap.getStyleRuleDescription( sett.style, pars );
		var baseTitle = FigisMap.label('Area of competence', pars );
		var skipTitle = ( title == '' );
		var ttitle = skipTitle ? baseTitle : title;
		if ( type.m ) {
			var ttitle = skipTitle ? baseTitle : title;
			if ( type.i ) ttitle += ' ' + FigisMap.label('(marine)', pars);
			pars.distribution.push( { rfb: pars.rfb, settings: sett, layer: FigisMap.fifao.RFB,
				filter: "RFB = '" + pars.rfb + "' AND DispOrder = '1'",
				dispOrder : 1,
				style: sett.style,
                hidden	: false,
				hideInSwitcher: false,
				title: ttitle,
				skipTitle: skipTitle
			} );
		}
		if ( type.i ) {
			var ttitle = skipTitle ? baseTitle : title;
			if ( type.m ) ttitle += ' ' + FigisMap.label('(inland)', pars);
			pars.distribution.push( { rfb: pars.rfb, settings: sett, layer: FigisMap.fifao.RFB,
				filter: "RFB = '" + pars.rfb + "' AND DispOrder = '2'",
				dispOrder : 2,
				style: sett.style,
                hidden	: false,
				hideInSwitcher: false,
				title: ttitle,
				skipTitle: skipTitle
			} );
		}
		if ( type.r ) {
			var ttitle = FigisMap.label('Regulatory area', pars );;
			pars.distribution.push( { rfb: pars.rfb, settings: sett, layer: FigisMap.fifao.RFB,
				filter: "RFB = '" + pars.rfb + "' AND DispOrder = '2'",
				dispOrder : 1,
				style: sett.style,
                hidden	: false,
				hideInSwitcher: false,
				title: ttitle,
				skipLegend: true
			} );
		}
		if ( type.a ) {
			var ttitle = FigisMap.label('Established limits of the area of competence', pars );;
			pars.distribution.push( { rfb: pars.rfb, settings: sett, layer: FigisMap.fifao.RFB,
				filter: "RFB = '" + pars.rfb + "_DEP'",
				style: '',
				hideInSwitcher: false,
                hidden	: false,
				title: ttitle,
				skipLegend: true
			} );
		}
		if ( pars.attribution == null ) pars.attribution = FigisMap.rfb.getDescriptor( pars.rfb, pars );
		if ( ! pars.projection ) pars.projection =  sett.srs ? sett.srs : FigisMap.defaults.projection(pars);
		if ( pars.global == null && sett.globalZoom != null ) pars.global = sett.globalZoom;
		if ( pars.extent == null ) {
			if ( sett.zoomExtent ) pars.extent = sett.zoomExtent;
			if ( sett.centerCoords ) pars.center = sett.centerCoords;
			if ( ! pars.dataProj ) pars.dataProj =  sett.srs ? sett.srs : FigisMap.defaults.projection(pars);
		} else {
			if ( ! pars.dataProj ) pars.dataProj =  pars.projection;
			if ( pars.center == null ) pars.center = false;
		}
	}
	if ( ! pars.mapSize ) pars.mapSize = 'L';
	if ( pars.landMask == null ) pars.landMask = true;
	return ( pars.rfbPreparsed = true );
	//if ( pars.projection.toString() == "3349" && ( pars.rfb == 'ICES' )) pars.global = false;
};

FigisMap.getStyleRuleDescription = function(STYLE, pars) {
	/**
	* Available Styles:
	* 3.  rfb_inland_noborder
	* 9.  rfb_marine_noborder
	* 15. rfb_unspecified_noborder 
	**/
	var l = FigisMap.label( STYLE, pars );
// 	if ( pars.isFIGIS ) l = l.replace(/&nbsp;/g,' ');
	if ( l == STYLE ) return '';
	return l;
}

/*
	Drawing function: FigisMap.draw( pars );
		pars --> map parameters, an object with properties:
			
			target		: (String or reference to HTML node) the DIV where the map will be actually stored.
			context		: (String) the name of actual map context, sometimes used for defaults (Optional, defaults to 'default')
			base		: (boolean (false) String | Object | Array) The base layer, has default (optional)
			distribution	: A "layer list" property, see below.
			intersecting	: A "layer list" property, see below.
			associated	: A "layer list" property, see below.
			projection	: (Integer/string) The projection of the map (optiona, defaults to 4326).
			dataProj	: (Integer/string) The projection used for source data (optional, defaults to 4326).
			rfb		: (String) name of RFB to be included (optional)
			countries	: (Array) An array of ISO3 country codes, automatic country_bounds is built in associated (optional, if pars.rfb defaults to RFB settings)
			legend		: (String or HTML node) the id of the legend DIV or a reference to the DIV (optional).
			legendType	: (String) the type of legend on display. Optional, defaults to autodetection
						if contains 'T' legend items will be in table(s)
						if contains 'P' (plain) no legend sections will be used
			countriesLegend	: (String or HTML node) the id of the legend DIV or a reference to the DIV (optional).
			watermark	: (Object) to set the map watermark (optional, defaults to FAO legend).
			landMask	: (boolean) true if the layer must be covered by the mask. Optional, defaults true.
			global		: (boolean) true to apply a global extent. Optional, defaults false.
			basicsLayers	: (boolean) true to add the FAO basic layers in the map. Optionla, defaults false.
			drawDataRect	: (boolean) to draw a data rectangle around the species layer. Optional, defaults false.
			extent		: (String) the map max extent. Optional, autoZoom on default.
			zoom		: (Number) the map initial zoom level. Optional, autoZoom on default.
		
		Returns --> a reference to the OpenLayers map object
	
	A "layer list" property can be:
		- null
		- a boolean (false) value
		- a string (name of layer)
		- a string in the old format "layername-filter/layername-filter/layername-filter"
		- an object with properties:
			- layer (string, name of intersecting layer). This is the only mandatory property.
			- filter (string or array) cql string of conditions, or a vector of "or" conditions.
			- style (string) layer style name
			- title (string) the title in legend and layer switcher, valued by layer label/name if missing
			- label (string) a Label to be used for title, with a FigisMap.label( label, pars ) multilanguage lookup
			- autoZoom (boolean) if true the map performs automatic zoom on this layer
			- skipTitle (boolean, default false) don't show title in legend, used when labels come from GeoServer
			- hidden (boolean, default false) hide in map by default
			- hideInSwitcher (boolean, default false) hide in Layer Switcher
			- dispOrder (integer) automatically detected if in filter, also changes layer disposition
			- rfb (string) A layer representing a RFB layer, the value is the name
			- wms (OpenLayers.Layer.WMS object) Automatically valued by default
		- an array of objects as described above.
		
		Once checked, it will be an array of { 'layer': '..', 'filter': ... }
		The filter property, if missing, will be false (boolean).
		
		In case no valid layers are found, the property will be valued with false.
	
*/
FigisMap.draw = function( pars ) {
	
	FigisMap.rfb.preparse( pars );
	pars = FigisMap.parser.parse( pars );
	if ( pars.parserError ) {
		alert( pars.parserError );
		return false;
	}
	
	FigisMap.lang = pars.lang;
	
	if ( FigisMap.renderedMaps[ pars.target.id ]) try {
		FigisMap.renderedMaps[ pars.target.id ].destroy();
		FigisMap.renderedMaps[ pars.target.id ] = null;
	} catch(e) {
		FigisMap.renderedMaps[ pars.target.id ] = false;
	}
	
	var rnd = new FigisMap.renderer( { debug: pars.debug } );
	var theMap = rnd.render( pars );
	
	FigisMap.lastMap = ( theMap && theMap.id && theMap.id.indexOf('OpenLayers.')==0 ) ? theMap : false;
	FigisMap.renderedMaps[ pars.target.id ] = FigisMap.lastMap;
	
	return FigisMap.lastMap;
};

FigisMap.renderer = function(options) {
	var toBoundArray = new Array();
	var boundsArray = new Array();
	var myMap = false;
	var p = new Object();
	var debug = options ? options.debug : false;
	var myBounds, boundsOrigin, boundsBox;
	var target, projection, extent, center, zoom;
	var olLayers = new Array();
	var olImageFormat = OpenLayers.Util.alphaHack() ? "image/gif" : "image/png";
    var info;
	
	// pink tile avoidance
	OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
	OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
	OpenLayers.Util.onImageLoadErrorColor = 'transparent';

	this.render = function( pars ) {
	
	OpenLayers.Util.onImageLoad = function(){
		// //////////////////////
		// OL code
		// //////////////////////
		if (!this.viewRequestID || (this.map && this.viewRequestID == this.map.viewRequestID)) { 
			this.style.display = "";  
		}

		OpenLayers.Element.removeClass(this, "olImageLoadError");

		// //////////////////////
		// Tuna code
		// ////////////////////// 
		if(myMap.getLayersByName('Established VME areas')[0]){        
			Ext.getCmp('years-slider').enable();
			Ext.getCmp("year-min-largestep").enable(); 
			Ext.getCmp("year-min-littlestep").enable(); 
			Ext.getCmp("year-max-littlestep").enable(); 
			Ext.getCmp("year-max-largestep").enable();
			Ext.getCmp("last-year").enable(); 
			Ext.getCmp("first-year").enable(); 
		}
	};
		
		FigisMap.debug( 'FigisMap.renderer render pars:', pars );
		
		projection = pars.projection;
		p = pars;
		
		if (projection == 3349) projection = 900913; // use google spherical mercator ...
		
		var mapMaxRes = FigisMap.rnd.maxResolution( projection, p );
		
		switch ( projection ) {
			case   3031 : myBounds = new OpenLayers.Bounds(-25000000, -25000000, 25000000, 25000000); break;
			case 900913 : myBounds = new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34); break;
			default     : projection = 4326; myBounds = new OpenLayers.Bounds(-180, -90, 180, 90);
		}
		
		boundsOrigin = new Array( myBounds.left, myBounds.bottom );
		boundsBox = new Array( myBounds.left, myBounds.bottom, myBounds.right, myBounds.top );
		
		// empty map DIV - the map, if any, is destroyed before calling
		while ( p.target.div.firstChild ) { p.target.div.removeChild(p.target.div.firstChild) }
		
		target = p.target.id;
		
		myMap = new OpenLayers.Map(
			p.target.id,
			{
				maxExtent: myBounds,
				restrictedExtent: ( projection == 3031 ? myBounds : null ),
				maxResolution: mapMaxRes,
				projection: new OpenLayers.Projection( 'EPSG:' + projection ),
				units: ( projection == 4326 ? 'degrees' : 'm' )
			}
		);
		
		// myMap.baseLayer
		myMap.addLayer( new OpenLayers.Layer.WMS(
			p.base.title,
			(p.base.remote ? (p.base.cached ? FigisMap.rnd.vars.remote.gwc : FigisMap.rnd.vars.remote.wms) : ( p.base.cached ? FigisMap.rnd.vars.gwc : FigisMap.rnd.vars.wms ) ),
			{ layers: p.base.layer, format: olImageFormat, TILED: true, TILESORIGIN: boundsOrigin, BBOX: boundsBox },
			{ wrapDateLine: true, buffer: 0, ratio: 1, singleTile: false }
		) );
		
		// Managing OL controls
		
		myMap.addControl( new OpenLayers.Control.LayerSwitcher() );
		myMap.addControl( new OpenLayers.Control.LoadingPanel() );
		myMap.addControl( new OpenLayers.Control.Navigation({ zoomWheelEnabled: true }) );
	
		FigisMap.rnd.watermarkControl( myMap, p );
		
		FigisMap.rnd.mouseControl( myMap, p );
	
		if ( p.attribution ) {
			// myMap.addControl( new OpenLayers.Control.Attribution() ); // seems to be unnecessary
			myMap.baseLayer.attribution = p.attribution;
		}
		
		
		if (projection != 3031) {
			// Modification for changing unit
			myMap.addControl( new OpenLayers.Control.ScaleLine({ maxWidth: 180, bottomOutUnits: "nmi", geodesic: true }) );
		}
		
		var layers = FigisMap.rnd.addAutoLayers( FigisMap.rnd.initLayers( p ), p );
		
		for ( var i = 0; i < layers.length; i++ ) {
			var l = layers[i];
			
			// check title and lsTitle (layer switcher title)
			if ( ! l.title ) l.title = FigisMap.label( l.label ? l.label : l.layer.replace(/^[^:]+:/,''), p);
			if ( ! l.lsTitle ) l.lsTitle = l.title;
			
			// determine source of the layer
			switch ( l.layer ) {
				case FigisMap.fifao.cnt : l.cached = true; break;
				case FigisMap.fifao.ma2 : l.cached = true; break;
				case FigisMap.fifao.nma : l.cached = true; break;
				default : l.cached = false;
			}
			
			// Add wms to layers missing it
			if ( ! l.wms ) {
			
				var wp = new Object(); // OpenLayers.Layer.WMS constructor Paramters
				
				wp.name = l.lsTitle;
				wp.url =  l.remote==true ? (l.cached ? FigisMap.rnd.vars.remote.gwc : FigisMap.rnd.vars.remote.wms) : ( l.cached ? FigisMap.rnd.vars.gwc : FigisMap.rnd.vars.wms );
			
				
				wp.params = { format: olImageFormat, transparent: true, TILED: true, TILESORIGIN: boundsOrigin, BBOX: boundsBox };
				wp.params.layers = l.layer;
				if ( l.filter && l.filter != '*' ) wp.params.cql_filter = l.filter;
				
				wp.options = { wrapDateLine: true, ratio: 1, buffer: 0, singleTile: false, opacity: 1.0 };
				if ( l.hideInSwitcher ) wp.options.displayInLayerSwitcher = false;
				if ( l.opacity ) wp.options.opacity = l.opacity;
				if ( l.hidden ) wp.options.visibility = false;
				
				l.wms = new OpenLayers.Layer.WMS( wp.name, wp.url, wp.params, wp.options );
			}
		}
		
		layers = FigisMap.rnd.sort4map( layers, p );
		var vme = new Array();
		// FILLING THE MAP
		for (var i = 0; i < layers.length; i++) {
			var l = layers[i];

			if ( l.inMap ) continue;
			if ( ! l.wms ) continue;

			if ( l.style && l.style != '*' && l.style != 'default' ) l.wms.mergeNewParams({ STYLES: l.style });
			
			//myMap.addLayer( l.wms );
			olLayers.push( l.wms );
			
			if (l.wms.name == 'Established VME areas' || l.wms.name == 'Footprints'  || l.wms.name == 'Encounters'  || l.wms.name == 'SurveyData'){
				vme.push(olLayers[i]);
			}

			l.inMap = true;
		}
		FigisMap.popupCache = {};
        
        

		var vmeLyr;
		for (vmeLyr=0; vmeLyr<vme.length; vmeLyr++){
            
            //VMSGetFeatureInfo FOR FIGIS-VME PROJECT
            info = new OpenLayers.Control.WMSGetFeatureInfo({
					autoActivate: true,
					layers: [vme[vmeLyr]],
					queryVisible: true,
					maxFeatures: 10,
					//vendorParams: {"CQL_FILTER": "year = '" + Ext.getCmp('years-slider').getValues()[0] + "'"},
					eventListeners: {
                        beforegetfeatureinfo: function(e) { 
                            this.vendorParams = {"CQL_FILTER": "YEAR = '" + Ext.getCmp('years-slider').getValues()[0] + "'"};
                        }, 
						getfeatureinfo: function(e) {
		                    var popupKey = e.xy.x + "." + e.xy.y;
							//var id = e.text.getElementByClassName("VME_ID");
		                    var popup;
		                    if (!(popupKey in FigisMap.popupCache)) {
				                popup = new GeoExt.Popup({
									title: 'Features Info',
									width: 400,
									height: 300,
									layout: "accordion",
									map: myMap,
									location: e.xy,
									listeners: {
										close: (function(key) {
										    return function(panel){
										        delete FigisMap.popupCache[key];
										    };
										})(popupKey)
									}
								});
								FigisMap.popupCache[popupKey] = popup;
		                    } else{
		                    	popup = FigisMap.popupCache[popupKey];
		                    }

		                    var addEncounters = function(btn) {
		                        myMap.getLayersByName('Encounters')[0].mergeNewParams({'CQL_FILTER': "YEAR = '" + Ext.getCmp('years-slider').getValues()[0] + "'"});
                                myMap.getLayersByName('Encounters')[0].visibility = btn.pressed;
                                myMap.getLayersByName('Encounters')[0].redraw(true);
		                    }
                            
		                    var addServeyData = function(btn) {
		                        myMap.getLayersByName('SurveyData')[0].mergeNewParams({'CQL_FILTER': "YEAR = '" + Ext.getCmp('years-slider').getValues()[0] + "'"});
                                myMap.getLayersByName('SurveyData')[0].visibility = btn.pressed;
                                myMap.getLayersByName('SurveyData')[0].redraw(true);
		                    }
							var buttonsVme = [];
							
							if (e.object.layers[0].name == 'Established VME areas' && FigisMap.rnd.status.logged == true){
								buttonsVme = [
											{
												iconCls : 'encounters-icon',
												text    : 'Encounters',
												enableToggle: true,
												pressed : myMap.getLayersByName('Encounters')[0].visibility,
												handler : addEncounters
											},{
												iconCls : 'surveydata-icon',
												text    : 'Survey Data',
												enableToggle: true,
												pressed :myMap.getLayersByName('SurveyData')[0].visibility,
												handler : addServeyData
											}
										]
	
							}
							var pattAllWite=new RegExp("\s");
							pattAllWite.test(e.text);
							popup.add({
										title: e.object.layers[0].name,
										layout: "fit",
										bodyStyle: 'padding:10px;background-color:#F5F5DC',
										html: e.text,
										autoScroll: true,
										autoWidth: true,
										collapsible: false,
										buttons : buttonsVme
							});
							popup.doLayout();
							popup.show();
						}
					}
				})
			//);
            myMap.addControl(info);
		};		                
		FigisMap.debug( 'FigisMap.renderer layers array, after filling map:', layers );
		
		// BUILDING THE LEGEND
		FigisMap.rnd.legend( layers, p );
		
		/** Alessio: create Stocks layer **/
		OpenLayers.Feature.Vector.style['default']['fill'] = false;
		OpenLayers.Feature.Vector.style['default']['fillOpacity'] = '0';
		OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2';
		

		
		//myMap.zoomToExtent( myBounds, true );
		if ( p.global ) {
			myMap.zoomToMaxExtent();
			FigisMap.debug('Render for p.global');
			finalizeMap();
		} else if ( p.extent || p.center || p.zoom ) {
			myMap.zoomToMaxExtent();
			FigisMap.debug('Render for Extent', p.extent, 'Zoom', p.zoom, 'Center', p.center );
			if ( p.extent ) myMap.zoomToExtent( FigisMap.ol.reBound( p.dataProj, projection, p.extent ), false);
			if ( p.zoom ) myMap.zoomTo( p.zoom, true );
			if ( p.center ) myMap.setCenter( FigisMap.ol.reCenter( p.dataProj, projection, p.center) );
			finalizeMap();
		} else {
			autoZoom( layers );
		}
			// handlig the zoom/center/extent
		if ( projection == 4326 ) myMap.addControl( new OpenLayers.Control.Graticule({ visible: false, layerName: FigisMap.label('Coordinates Grid', p) }) );
		FigisMap.debug('myMap:', myMap );
		return myMap;
		
	} //function ends
	
	function finalizeMap() {
		FigisMap.debug('Finalizing map:', myMap, 'olLayers:',olLayers);
		myMap.updateSize();
		myMap.addLayers( olLayers );
		if ( FigisMap.isDeveloper || FigisMap.isTesting ) {
			myMap.events.register(
				'moveend',
				this,
				function(){
					FigisMap.console( [
						'Map moved/zoomed, center:', myMap.getCenter(),
						'Extent:', myMap.getExtent(),
						'Projection:', myMap.getProjection()
					], false );
				}
			);
		}
	}
	
	function autoZoom( layers ) {
		FigisMap.debug('Check autoZoom on:', layers, 'toBoundArray:', toBoundArray);
		for (var i = 0; i < layers.length; i++) {
			var l = layers[i];
			if ( l.autoZoom ) {
				var url = FigisMap.rnd.vars.wfs + l.layer;
				if (l.filter != "*") {
					var flt = String( l.filter );
					if ( l.dispOrder ) flt = flt.replace(/ and disporder.*$/i,'');
					flt = '&cql_filter=' + escape('(' + flt + ')');
// 						flt = '&cql_filter=(' + flt.replace(/ /g,'%20') + ')';
					flt += '&propertyName=' + String( l.filter ).replace(/^[^a-z0-9]*([^ =]+).*/i,"$1");
					url += FigisMap.useProxy ? escape( flt ) : flt.replace(/ /g,'%20');
				}
				FigisMap.debug('autoZoom on:', l, 'url:', url );
				toBoundArray.push( url );
			}
		}
		if ( toBoundArray.length != 0 ) {
			FigisMap.debug('toBoundArray:', (new Array()).concat(toBoundArray) );
			for ( var i = 0; i < toBoundArray.length; i++ ) {
				OpenLayers.Request.GET({ url: toBoundArray[i], callback: autoZoomStep });
			}
		} else {
			FigisMap.debug('No autozoom layers found');
			myMap.zoomToMaxExtent();
			finalizeMap();
		}
	}
	
	function autoZoomStep( req ) {
		if ( req  && req.status ) {
			var bounds = false;
			if (req.status == 200) {
				bounds = FigisMap.ol.gmlBbox( req.responseXML );
				FigisMap.debug( 'autoZoomStep Bounds:', bounds );
				boundsArray.push(bounds);
			}
		}
		if ( toBoundArray.length == boundsArray.length ) autoZoomEnd();
	}
	
	function autoZoomEnd() {
		var bounds, gbounds = new Array();
		for ( var i = 0; i < boundsArray.length; i++ ) if( boundsArray[i] ) gbounds.push( boundsArray[i] );
		if ( gbounds.length != 0 ) {
			bounds = gbounds[0];
			//for (var i = 1; i < gbounds.length; i++) bounds.extend( gbounds[i] );
			for (var i = 1; i < gbounds.length; i++) bounds = FigisMap.ol.extend( bounds, gbounds[i] );
		} else {
			bounds = myMap.getMaxExtent();
		}
		if ( bounds ) {
			var proj = parseInt( myMap.projection.projCode.replace(/^EPSG:/,'') );
			
			var nb = FigisMap.ol.reBound( p.dataProj, proj, bounds );
			
			myMap.zoomToExtent( nb, false );
			
			var nc = false;
			if ( proj == 3031 ) {
				// center to south pole in polar projection
				nc = FigisMap.ol.reCenter( 4326, proj );
			} else if ( proj == 900913 || proj == 3349 ) {
				// center to Pacific centre in Mercator - only if larger than 35k km (whole world)
				var nbw = Math.abs( nb.right - nb.left );
				if ( nbw > 35000000 ) {
					nc = FigisMap.ol.reCenter( 4326, proj );
					nc.lat = ( nb.top + nb.bottom )/2;
				}
			}
			if ( nc ) myMap.setCenter( nc );
			FigisMap.debug( 'FigisMap.renderer autoZoom values:', { bounds: bounds, boundsSize: bounds.getSize(), nb: nb, nc : nc, mapSize: myMap.getSize() } );
		}
		finalizeMap();
	}
	
	/*
	// parseDataRectangle
	function parseDataRectangle(req, theMap) {
		var options = { returnBbox: true };
		var g = new OpenLayers.Format.GML();
		features = g.read(req.responseText, options);
		
		var bounds = features.bbox;
		var minx = bounds.left;
		var miny = bounds.bottom;
		var maxx = bounds.right;
		var maxy = bounds.top;
		
		if (maxx - minx < 200) {
			var vectorLayer = new OpenLayers.Layer.Vector("Species Envelope");
			var style_polygon = {
				strokeColor: "black",
				strokeOpacity: 1,
				strokeWidth: 1,
				fillOpacity: 0
			};
			var pointList = [];
			if (maxx - minx < 12) {
				minx = minx - 2;
				miny = miny - 2;
				maxx = maxx + 2;
				maxy = maxy + 2;
			}
			var newPoint1 = new OpenLayers.Geometry.Point(minx, miny);
			pointList.push(newPoint1);
			var newPoint2 = new OpenLayers.Geometry.Point(minx, maxy);
			pointList.push(newPoint2);
			var newPoint3 = new OpenLayers.Geometry.Point(maxx, maxy);
			pointList.push(newPoint3);
			var newPoint4 = new OpenLayers.Geometry.Point(maxx, miny);
			pointList.push(newPoint4);
			
			pointList.push(pointList[0]);
			
			var linearRing = new OpenLayers.Geometry.LinearRing(pointList);
			polygonFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([linearRing]), null, style_polygon);
			theMap.addLayer(vectorLayer);
			vectorLayer.addFeatures([polygonFeature]);
		}
		//theMap.zoomToMaxExtent();
	} // function ends
	*/
	
} //FigisMap.renderer Class Ends
Ext.onReady(function(){
FigisMap.loginWin.on('login',function(user){
            for (var popupKey in FigisMap.popupCache){                
                FigisMap.popupCache[popupKey].close();
            }            
        });

FigisMap.loginWin.on('logout',function(user){
		for (var popupKey in FigisMap.popupCache){                
                FigisMap.popupCache[popupKey].close();
		}
        myMap.getLayersByName('Encounters')[0].mergeNewParams({'CQL_FILTER': "YEAR = '1000'"});
        myMap.getLayersByName('Encounters')[0].visibility = false;
        myMap.getLayersByName('Encounters')[0].redraw(true);
        
        myMap.getLayersByName('SurveyData')[0].mergeNewParams({'CQL_FILTER': "YEAR = '1000'"});
        myMap.getLayersByName('SurveyData')[0].visibility = false;
        myMap.getLayersByName('SurveyData')[0].redraw(true);
});

});
