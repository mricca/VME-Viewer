/*
	vme-data.js
	data model and stores for VME using Extjs
	Authors: Lorenzo Natali. Geo-Solutions
	
	Status: Beta.	
*/

/**
 * Ext.ux.LazyJSonStore: lazyStore to load without 
 * knowing the total size of result list. Useful for
 * paged queries when the total number of records is 
 * not available/required
 *
 */
Ext.ux.LazyJsonStore = Ext.extend(Ext.data.JsonStore,{
	resetTotal:function (){
		this.tot = null;
	
	},
	loadRecords : function(o, options, success){
		if (this.isDestroyed === true) {
			return;
		}
		if(!o || success === false){
			if(success !== false){
				this.fireEvent('load', this, [], options);
			}
			if(options.callback){
				options.callback.call(options.scope || this, [], options, false, o);
			}
			return;
		}
		this.crs = this.reader.jsonData.crs;
		this.bbox =  this.reader.jsonData.bbox;
		this.featurecollection = this.reader.jsonData;
		//custom total workaround
		var estimateTotal = function(o,options,store){
			var current = o.totalRecords + options.params[store.paramNames.start] ;
			var currentCeiling = options.params[store.paramNames.start] + options.params[store.paramNames.limit];
			if(current < currentCeiling){
				store.tot = current;
				return current;
			}else{
				
				return  store.tot || 100000000000000000; 
			}

		}
		o.totalRecords = estimateTotal(o,options,this);
		//end of custom total workaround
		
		var r = o.records, t = o.totalRecords || r.length;
		if(!options || options.add !== true){
			if(this.pruneModifiedRecords){
				this.modified = [];
			}
			for(var i = 0, len = r.length; i < len; i++){
				r[i].join(this);
			}
			if(this.snapshot){
				this.data = this.snapshot;
				delete this.snapshot;
			}
			this.clearData();
			this.data.addAll(r);
			this.totalLength = t;
			this.applySort();
			this.fireEvent('datachanged', this);
		}else{
			this.totalLength = Math.max(t, this.data.length+r.length);
			this.add(r);
		}
		this.fireEvent('load', this, r, options);
		if(options.callback){
			options.callback.call(options.scope || this, r, options, true);
		}
	}
	
});


/*
//get georeferences
var MarineAreas = new Ext.ux.WFSStore({typeName:'fifao:MarineAreas'});
MarineAreas.load({
	callback:function(records,options,success){
		var georeferences = {};
		var GeoJsonFormat = new OpenLayers.Format.GeoJSON();
		records= this.reader.jsonData.features;
		for (var i=0; i<records.length; i++){
			var selectedRecord = records[i]; 
			var geoJsonGeom= selectedRecord["geometry"];
			var geom = GeoJsonFormat.read(geoJsonGeom, "Geometry");
			var name = selectedRecord["properties"].Name;
			georeferences[name] = {
				zoomExtent:geom.getBounds().toBBOX()
			};
			
		}
		console.log (JSON.stringify(georeferences));
	}
});
*/
	
	
/**
 * Ext.ux.LazyPagingToolbar
 * Paging toolbar for lazy stores like Ext.ux.LazyJsonStore
 */
Ext.ux.LazyPagingToolbar = Ext.extend(Ext.PagingToolbar,{
		
		displayInfo: true,
		displayMsg: "",
		emptyMsg: "",
		afterPageText:"",
		beforePageText:"",
		onLoad : function(store, r, o){
			if(!this.rendered){
				this.dsLoaded = [store, r, o]; 
				return;
			}
			var p = this.getParams();
			this.cursor = (o.params && o.params[p.start]) ? o.params[p.start] : 0;
			var d = this.getPageData(), ap = d.activePage, ps = d.pages;

			this.afterTextItem.setText(String.format(this.afterPageText, d.pages));
			this.inputItem.setValue(ap);
			this.first.setDisabled(ap == 1);
			this.prev.setDisabled(ap == 1);
			this.next.setDisabled(ap >= ps);
			this.last.setDisabled(ap >= ps);
			this.refresh.enable();
			this.updateInfo();
			this.fireEvent('change', this, d);
		},
		listeners:{
			beforerender: function(){
				this.refresh.setVisible(false);
				this.last.setVisible(false);
			},
			change: function (total,pageData){
				if(pageData.activePage>pageData.pages){
					this.movePrevious();
					this.next.setDisabled(true);
				}
				
			}
		}
})

var Vme={
	utils: {
		generateDownloadLink :function(ows,types,filters,format,otherparams){
			try{
				var cql_filter = filters.join(";");
			}catch(e){
				cql_filter =filters;
			}
			try{
				var typeName = types.join(",");
			}catch(e){
				typeName = types;
			}
			var addParams = "";
			for (var name in otherparams){
				addParams += "&" + name + "=" + encodeURIComponent( otherparams[name] );
			}
			return ows+"?service=WFS&version=1.0.0&request=GetFeature" 
				+"&typeName="+ encodeURIComponent(typeName)
				+ "&outputFormat=" + encodeURIComponent( format )
				+ (cql_filter ? "&cql_filter=" + encodeURIComponent( cql_filter ):"")
				+ addParams;
									
		
		},
		generateFidFilter:function(fids){
			if(fids ==undefined) return ;
			var len = fids.length;
			if(!len) return ;
			
			var filter = "IN ('" +fids[0]+"'";
			for (var i=1; i<len ;i++){
				filter += ",'" +fids[i]+ "'";
			} 
			filter += ")"
			return filter;
		
		},
		generateVMEFilter:function(vme_id){
			if (vme_id ==undefined) return ;
			return "VME_ID = '" +vme_id +"'"
		}
		
	}


};



/** 
 * Vme.data contains templates and base Extjs Stores, models to load Vme data
 */
Vme.data={
	templates: {
		/** Vme.data.templates.searchResult
		 * displays search results with utiities to display human readable fields
	     */
		searchResult: 
			new Ext.XTemplate(
				'<tpl for=".">'+
					'<div class="search-result">' +
						'<em>Local Name:</em>{localname}<br/>'+
						'<em>Status:</em><span class="status" >{[this.writeStatus(values.status)]}</span><br/>' +
						'<em>Reporting Year:</em>{year} <br/> '+
						'<em>Area Type:</em><span>{type}</span> <br/> '+
						'<em>Geographic reference:</em><span class="geo_ref" >{geo_ref}</span> <br/>'+
						
						//'<span class="id" >{vme_id}</span><br/>'+
						'<span class="own" >{owner}</span><br/>'+
						'<span class="source" style="font-weight:bold">Vulnerable Marine Ecosystem Database</span>'+
					'</div>'+
				'</tpl>',
				{
					compiled:true,
					writeStatus:function(status){
						var statusRecord=  Vme.data.stores.VmeStatusStore.getById(status);
						var text =statusRecord ? statusRecord.get('displayText'):status;
						return text;
					}
				}
			),
			
		vme: 
			new Ext.XTemplate(
				'<tpl for=".">'+
					'<div class="search-result" style="text-align:left;position:relative">' +
						'<em>Local Name: </em>{localname}<br/>'+
						'<em>Geographic reference: </em><span class="geo_ref" >{geo_ref}</span> <br/>'+
						'<em>Area Type: </em><span>{type}</span> <br/> '+
						'<em>Status: </em> <span class="status" >{[this.writeStatus(values.status)]}</span><br/>' +
						'<em>Validity Period: </em><span>from 2007 up to 2014</span> <br/> '+
						'<em>Reporting Year: </em>{year}<br/> '+
						'<em>Competent Authority:</em><span class="own"> {owner}</span><br/>'+
						'<em>Vme ID:</em><span class="own"> {vme_id}</span><br/>'+
						'<br/><br/>'+
						'<div>'+
						'<div style="position:absolute;right:5px;text-align:right;bottom:3px;">' +
							'<a class="factlink" target="_blank" href="http://www.fao.org/fishery/species/2525/en">link to factsheet </a><br/>' +
							'<a class="zipmlink" target="_blank" href="{[this.getDownloadLink(values)]}">Download ShapeFile</a><br/>' +
							'{[this.getDownloadFDS(values)]}' +
						'</div>' +
						'<div style="position:absolute;left:5px;text-align:left;bottom:3px;">' +
							'<a class="zoomlink" onClick="'+
								'myMap.zoomToExtent(OpenLayers.Bounds.fromString( \'{[this.getBBOX(values)]}\'));'+
								'FigisMap.ol.emulatePopupFromVert({[this.getVert(values.geometry)]})'+
							'">zoom</a>' +
							'<br/>{[this.addProtectedLinks(values)]}' +
						'</div>'+
						'</div>'+
					'</div>'+
				'</tpl>',
				{
					compiled:true,
					writeStatus:function(status){
						var statusRecord=  Vme.data.stores.VmeStatusStore.getById(status);
						var text =statusRecord ? statusRecord.get('displayText'):status;
						return text;
					},
					getBBOX:function(values){
						var projcode = "EPSG:4326";
						if(myMap.getProjection() == projcode ){
							bbox = values.bbox;
							return bbox.toArray(); 
						}else{
							var geom = values.geometry;
							var repro_geom = geom.clone().transform(
							new OpenLayers.Projection(projcode),
							myMap.getProjectionObject()
						);
						
						var repro_bbox = repro_geom.getBounds();
						return repro_bbox.toArray();
						
						}
					},
					getVert: function(geom){
						vert  = geom.getVertices()[0];
						
						return "{x:"+vert.x+",y:"+vert.y+"}";
						//return evt;
					},
					/**
					 * Download all vme areas
					 */
					getDownloadLink: function(values){
						return Vme.utils.generateDownloadLink(
							FigisMap.rnd.vars.ows,
							FigisMap.fifao.vme,
							Vme.utils.generateVMEFilter(values.vme_id),
							"shape-zip",
							{format_options:"filename:VME-DB_"+values.vme_id+".zip"}
						)
						//return +"?service=WFS&version=1.0.0&request=GetFeature&typeName=" + FigisMap.fifao.vme+ "&outputFormat=shape-zip" +
						//	"&cql_filter=" + encodeURIComponent( "YEAR = '" + values.year + "' AND VME_ID = '" +values.vme_id +"'" )
							
					},
					/**
					 * Download all vme areas + encoutners & sd for this vme
					 */
					getDownloadFDS:function(values){
						if(!FigisMap.rnd.status.logged){
							return "";
						}
						var filter = Vme.utils.generateVMEFilter(values.vme_id);
						filter =filter +";"+ filter + ";" + filter;
						return '<a class="zipmlink" target="_blank" href="'+
							Vme.utils.generateDownloadLink(
								FigisMap.rnd.vars.ows,
								[FigisMap.fifao.vme,FigisMap.fifao.vme_en,FigisMap.fifao.vme_sd],
								filter,
								"shape-zip",
								{format_options:"filename:VME-DB_"+values.vme_id+"_DS.zip"}
							)
							+'">Download full Data Set</a>' ;
					},
					addProtectedLinks: function(values){
						if(!FigisMap.rnd.status.logged){
							return "";
						}
						return  '<a class="rellink" onClick=\'Ext.MessageBox.show({title: "Info",msg: "Related Encounters and Survey Data not implemented yet",buttons: Ext.Msg.OK,icon: Ext.MessageBox.INFO,scope: this}); \'>Related</a>'
						
						
						
					}
				}
			),
		encounters :
			new Ext.XTemplate(
				'<tpl for=".">'+
					'<div class="search-result" style="text-align:left;position:relative">' +						
						'<em>Taxa: </em><span>{taxa}</span> <br/> '+
						'<em>Reporting Year: </em>{year}<br/> '+
						'<em>Quantity: </em><span>{quantity} {unit}</span> <br/> '+
						'<em>Vme ID:</em><span class="own"> {vme_id}</span><br/>'+
						'<br/><br/>'+
						'<div>'+
						'<div style="position:absolute;right:5px;text-align:right;bottom:3px;">' +
							'<a class="zipmlink" target="_blank" href="{[this.getDownloadLink(values)]}">Download ShapeFile</a>' +
						'</div>' +
						'<div style="position:absolute;left:5px;text-align:left;bottom:3px;">' +
							'<a class="zoomlink" onClick="'+
								'myMap.zoomToExtent(OpenLayers.Bounds.fromString( \'{[this.getBBOX(values)]}\'));'+
								'FigisMap.ol.emulatePopupFromVert({[this.getVert(values.geometry)]})'+
							'">zoom</a>' +
						'</div>'+
						'</div>'+
					'</div>'+
				'</tpl>',
				{
					compiled:true,
					writeStatus:function(status){
						var statusRecord=  Vme.data.stores.VmeStatusStore.getById(status);
						var text =statusRecord ? statusRecord.get('displayText'):status;
						return text;
					},
					getBBOX:function(values){
						var projcode = "EPSG:4326";
						if(myMap.getProjection() == projcode ){
							bbox = values.bbox;
							return bbox.toArray(); 
						}else{
							var geom = values.geometry;
							var repro_geom = geom.clone().transform(
							new OpenLayers.Projection(projcode),
							myMap.getProjectionObject()
						);
						
						var repro_bbox = repro_geom.getBounds();
						return repro_bbox.toArray();
						
						}
					},
					getVert: function(geom){
						vert  = geom.getVertices()[0];
						
						return "{x:"+vert.x+",y:"+vert.y+"}";
						//return evt;
					},
					/**
					 * Downloads the single point
					 */
					getDownloadLink: function(values){
						return Vme.utils.generateDownloadLink(
							FigisMap.rnd.vars.ows,
							FigisMap.fifao.vme_en,
							Vme.utils.generateFidFilter(values.id),
							"shape-zip",
							{format_options:"filename:VME-DB_ENC_"+values.vme_id+"_SP.zip"}
						)
						//return +"?service=WFS&version=1.0.0&request=GetFeature&typeName=" + FigisMap.fifao.vme+ "&outputFormat=shape-zip" +
						//	"&cql_filter=" + encodeURIComponent( "YEAR = '" + values.year + "' AND VME_ID = '" +values.vme_id +"'" )
							
					},
					/**
					 * Download all points for this vme
					 */
					getDownloadFDS:function(values){
						if(!FigisMap.rnd.status.logged){
							return "";
						}
						
						return '<a class="zipmlink" target="_blank" href="'+
							Vme.utils.generateDownloadLink(
								FigisMap.rnd.vars.ows,
								FigisMap.fifao.vme_en,
								Vme.utils.generateVMEFilter(values.vme_id),
								"shape-zip",
								{format_options:"filename:VME-DB_ENC_"+values.vme_id+".zip"}
							)
							+'">Download full Data Set</a>' ;
					}
				}
			),
		surveydata :
			new Ext.XTemplate(
				'<tpl for=".">'+
					'<div class="search-result"  style="text-align:left;position:relative">' +						
						'<em>Taxa: </em><span>{taxa}</span> <br/> '+
						'<em>Reporting Year: </em>{year}<br/> '+
						'<em>Quantity: </em><span>{quantity} {unit}</span> <br/> '+
						'<em>Vme ID:</em><span class="own"> {vme_id}</span><br/>'+
						'<br/><br/>'+
						'<div>'+
						'<div style="position:absolute;right:5px;text-align:right;bottom:3px;">' +
							'<a class="zipmlink" target="_blank" href="{[this.getDownloadLink(values)]}">Download ShapeFile</a>' +
						'</div>' +
						'<div style="position:absolute;left:5px;text-align:left;bottom:3px;">' +
							'<a class="zoomlink" onClick="'+
								'myMap.zoomToExtent(OpenLayers.Bounds.fromString( \'{[this.getBBOX(values)]}\'));'+
								'FigisMap.ol.emulatePopupFromVert({[this.getVert(values.geometry)]})'+
							'">zoom</a>' +
						'</div>'+
						'</div>'+
					'</div>'+
				'</tpl>',
				{
					compiled:true,
					writeStatus:function(status){
						var statusRecord=  Vme.data.stores.VmeStatusStore.getById(status);
						var text =statusRecord ? statusRecord.get('displayText'):status;
						return text;
					},
					getBBOX:function(values){
						var projcode = "EPSG:4326";
						if(myMap.getProjection() == projcode ){
							bbox = values.bbox;
							return bbox.toArray(); 
						}else{
							var geom = values.geometry;
							var repro_geom = geom.clone().transform(
							new OpenLayers.Projection(projcode),
							myMap.getProjectionObject()
						);
						
						var repro_bbox = repro_geom.getBounds();
						return repro_bbox.toArray();
						
						}
					},
					getVert: function(geom){
						vert  = geom.getVertices()[0];
						
						return "{x:"+vert.x+",y:"+vert.y+"}";
						//return evt;
					},
					/**
					 * Downloads the single point
					 */
					getDownloadLink: function(values){
						return Vme.utils.generateDownloadLink(
							FigisMap.rnd.vars.ows,
							FigisMap.fifao.vme_sd,
							Vme.utils.generateFidFilter(values.id),
							"shape-zip",
							{format_options:"filename:VME-DB_SD_"+values.vme_id+"_SP.zip"}
						)
						//return +"?service=WFS&version=1.0.0&request=GetFeature&typeName=" + FigisMap.fifao.vme+ "&outputFormat=shape-zip" +
						//	"&cql_filter=" + encodeURIComponent( "YEAR = '" + values.year + "' AND VME_ID = '" +values.vme_id +"'" )
							
					},
					/**
					 * Download all points for this vme
					 */
					getDownloadFDS:function(values){
						if(!FigisMap.rnd.status.logged){
							return "";
						}
						
						return '<a class="zipmlink" target="_blank" href="'+
							Vme.utils.generateDownloadLink(
								FigisMap.rnd.vars.ows,
								FigisMap.fifao.vme_sd,
								Vme.utils.generateVMEFilter(values.vme_id),
								"shape-zip",
								{format_options:"filename:VME-DB_SD_"+values.vme_id+".zip"}
							)
							+'">Download full Data Set</a>' ;
					}
				}
			),
		aggregate :
			new Ext.XTemplate(
				'<tpl for=".">'+
					'<div class="search-result" style="text-align:left">' +
						'<em>Count: </em>{count}<br/>'+
						'<em>Year: </em> <span class="status" >{year}</span><br/>' +
						'<em>Competent Authority: </em> <span class="status" >{owner}</span><br/>' +
					'</div>'+
				'</tpl>',
				{
					compiled:true
					
				}
			),
		footprints :
			new Ext.XTemplate(
				'<tpl for=".">'+
					'<div class="search-result" style="text-align:left;position:relative;">' +
						'<em>VME_NAFO bottom fishing areas ("footprint") </em>{localname}<br/>'+
						'<em>Last referene Year: </em>{year}<br/> '+
						'<br/><br/>'+
						'<div>'+
						'<div style="position:absolute;right:5px;text-align:right;bottom:3px;">' +
							'<a class="zipmlink" target="_blank" href="{[this.getDownloadLink(values)]}">Download ShapeFile </a>' +
						'</div>' +
						'<div style="position:absolute;left:5px;text-align:left;bottom:3px;">' +
							'<a class="zoomlink" onClick="'+
								'myMap.zoomToExtent(OpenLayers.Bounds.fromString( \'{[this.getBBOX(values)]}\'));'+
								'FigisMap.ol.emulatePopupFromVert({[this.getVert(values.geometry)]})'+
							'">zoom</a>' +
						'</div>'+
						'</div>'+
					'</div>'+
				'</tpl>',
				{
					compiled:true,
					writeStatus:function(status){
						var statusRecord=  Vme.data.stores.VmeStatusStore.getById(status);
						var text =statusRecord ? statusRecord.get('displayText'):status;
						return text;
					},
					getBBOX:function(values){
						var projcode = "EPSG:4326";
						if(myMap.getProjection() == projcode ){
							bbox = values.bbox;
							return bbox.toArray(); 
						}else{
							var geom = values.geometry;
							var repro_geom = geom.clone().transform(
							new OpenLayers.Projection(projcode),
							myMap.getProjectionObject()
						);
						
						var repro_bbox = repro_geom.getBounds();
						return repro_bbox.toArray();
						
						}
					},
					getVert: function(geom){
						vert  = geom.getVertices()[0];
						
						return "{x:"+vert.x+",y:"+vert.y+"}";
						//return evt;
					},
					getDownloadLink: function(values){
						return Vme.utils.generateDownloadLink(
							FigisMap.rnd.vars.ows,
							FigisMap.fifao.vme_fp,
							Vme.utils.generateFidFilter([values.id]),
							"shape-zip"
						)
						//return +"?service=WFS&version=1.0.0&request=GetFeature&typeName=" + FigisMap.fifao.vme+ "&outputFormat=shape-zip" +
						//	"&cql_filter=" + encodeURIComponent( "YEAR = '" + values.year + "' AND VME_ID = '" +values.vme_id +"'" )
							
					}
					
				}
			)
	},
	constants:{
		pageSize:5
	}

};



/**
 * Models: base tipes for Vme for Extjs Stores 
 *
 */
Vme.data.models = {
	rfmos : [['CCAMLR','CCAMLR'],['NAFO','NAFO'],['NEAFC','NEAFC']],
	areaTypes : [
		[0, FigisMap.label('VME_TYPE_VME')],
		[1, FigisMap.label('VME_TYPE_RISK')],
		[2, FigisMap.label('VME_TYPE_BPA')],
		[3, FigisMap.label('VME_TYPE_CLOSED')],
		[4, FigisMap.label('VME_TYPE_OTHER')]
	],
	VmeStatuses:[ 
		[0, FigisMap.label("VME_STATUS_ENS")],
		[1, FigisMap.label("VME_STATUS_UNDEST")],
		[2, FigisMap.label("VME_STATUS_VOL")],
		[3, FigisMap.label("VME_STATUS_EXP")],
		[4, FigisMap.label("VME_STATUS_POT")],
		[5, FigisMap.label("VME_STATUS_TEMP")]
		
	],
	VmeCriteria:[ 
		[0, FigisMap.label("VME_CRITERIA_UNIQUE")],
		[1, FigisMap.label("VME_CRITERIA_FUNCT")],
		[2, FigisMap.label("VME_CRITERIA_FRAG")],
		[3, FigisMap.label("VME_CRITERIA_LIFE")],
		[4, FigisMap.label("VME_CRITERIA_STRUCT")],
		[5, FigisMap.label("VME_CRITERIA_NOTS")]
	],	
	years : (function(){var currentTime = new Date();var now=currentTime.getFullYear();var year=2000;var ret=[];while(year<=now){ret.push([now]);now--;}return ret;})()

};

Vme.data.extensions ={
	FeatureInfo:{
		VmeStore : Ext.extend(Ext.data.JsonStore,{
			reader : new Ext.data.JsonReader({
				root:'',
				fields: [
					{name: 'id', mapping: 'fid'},
					{name: 'geometry', mapping: 'geometry'},
					{name: 'localname',  mapping: 'attributes.LOCAL_NAME'},
					{name: 'bbox',		mapping: 'bounds'},
					{name: 'vme_id',     mapping: 'attributes.VME_ID'},
					{name: 'status', 	 mapping: 'attributes.STATUS'},
					{name: 'year', mapping: 'attributes.YEAR'},
					{name: 'type', mapping: 'attributes.VME_TYPE'},
					{name: 'owner', mapping: 'attributes.OWNER'},
					{name: 'geo_ref', mapping: 'attributes.GEO_AREA'}
					
					
				],
				idProperty: 'fid'
			
			})
		}),
		
		EncountersStore : Ext.extend(Ext.data.JsonStore,{
			reader : new Ext.data.JsonReader({
				root:'',		
				fields: [
					{name: 'id', mapping: 'fid'},
					{name: 'geometry', mapping: 'geometry'},
					{name: 'object_id',  mapping: 'attributes.OBJECTID'},
					{name: 'bbox',		mapping: 'bounds'},
					{name: 'vme_id',     mapping: 'attributes.VME_ID'},
					{name: 'aggregation', 	 mapping: 'attributes.AGREGATION'},
					{name: 'year', mapping: 'attributes.YEAR'},
					{name: 'taxa', mapping: 'attributes.TAXA'},
					{name: 'quantity', mapping: 'attributes.QUANTITY'},
					{name: 'unit', mapping: 'attributes.UNIT'},
					{name: 'owner', mapping: 'attributes.OWNER'}


				],
				idProperty: 'fid'
			
			})
		}),
		SurveyDataStore : Ext.extend(Ext.data.JsonStore,{
			reader : new Ext.data.JsonReader({
				root:'',
				fields: [
		    	{name: 'id', mapping: 'fid'},
					{name: 'geometry', mapping: 'geometry'},
					{name: 'object_id',  mapping: 'attributes.OBJECTID'},
					{name: 'bbox',		mapping: 'bounds'},
					{name: 'vme_id',     mapping: 'attributes.VME_ID'},
					{name: 'aggregation', 	 mapping: 'attributes.AGREGATION'},
					{name: 'year', mapping: 'attributes.YEAR'},
					{name: 'taxa', mapping: 'attributes.TAXA'},
					{name: 'quantity', mapping: 'attributes.QUANTITY'},
					{name: 'unit', mapping: 'attributes.UNIT'},
					{name: 'owner', mapping: 'attributes.OWNER'}
					
					
				],
				idProperty: 'fid'
			
			})
		}),
		AggregateDataStore : Ext.extend(Ext.data.JsonStore,{
			reader : new Ext.data.JsonReader({
				root:'',
				fields: [
						{name: 'id', mapping: 'fid'},
					{name: 'geometry', mapping: 'geometry'},
					{name: 'resolution',  mapping: 'attributes.RESOLUTION'},
					{name: 'bbox',		mapping: 'bounds'},
					{name: 'vme_id',     mapping: 'attributes.VME_ID'},
					{name: 'count', 	 mapping: 'attributes.COUNT'},
					{name: 'year', mapping: 'attributes.YEAR'},
					{name: 'owner', mapping: 'attributes.OWNER'}
					
					
				],
				idProperty: 'fid'
			
			})
		}),
		FootprintStore : Ext.extend(Ext.data.JsonStore,{
			reader : new Ext.data.JsonReader({
				root:'',
				fields: [
					{name: 'id', mapping: 'fid'},
					{name: 'geometry', mapping: 'geometry'},
					{name: 'localname',  mapping: 'attributes.LOCAL_NAME'},
					{name: 'bbox',		mapping: 'bounds'},
					{name: 'vme_id',     mapping: 'attributes.VME_ID'},
					{name: 'status', 	 mapping: 'attributes.STATUS'},
					{name: 'year', mapping: 'attributes.YEAR'},
					{name: 'type', mapping: 'attributes.VME_TYPE'},
					{name: 'owner', mapping: 'attributes.OWNER'},
					{name: 'geo_ref', mapping: 'attributes.GEO_AREA'}
					
					
				],
				idProperty: 'fid'
			
			})
		})
		
	
	},
	WFS:{
		/**
		 * Vme.data.extensions.WFS.WFSStore: WFS generic store 
		 * you can replace fields to get the needed properties
		 * (e.g. {name:'myprop',mapping: 'properties.myprop'
		 * properties:
		 * * typeName - the featureType  
		 *
		 */
		WFSStore : Ext.extend(Ext.ux.LazyJsonStore,{
			//combo:this,
			
			typeName: FigisMap.fifao.vme,
			reader: new Ext.data.JsonReader({
				root:'features',
				idProperty:'id', 
				fields: [
					{name: 'id', mapping: 'id'},
					{name: 'geometry', mapping: 'geometry'},
					{name: 'properties',  mapping: 'properties'},
					{name: 'type',		mapping: 'type'}
				]
			}),
			messageProperty: 'crs',
			autoLoad: true,
			
			
			proxy : new Ext.data.HttpProxy({
				method: 'GET',
				url: FigisMap.rnd.vars.ows

			}),
			
			recordId: 'id',
			paramNames:{
				start: "startindex",
				limit: "maxfeatures",
				sort: "sortBy"
			},
			
			baseParams:{
				service:'WFS',
				version:'1.0.0',
				request:'GetFeature',
				outputFormat:'json',
				srs:'EPSG:4326'
			},
			listeners:{
				beforeload: function(store,options){
					//store.setBaseParam( 'srs',store.srsName );
					if(!options.typeName){
						store.setBaseParam( 'typeName',store.typeName);
						
					}
				}
			}
		})
	
	}
}


/**
 * Stores for data for Vme components
 */
Vme.data.stores = {
	rfmoStore: new Ext.data.ArrayStore({
		fields: [
			'id',
            'name',
				
        ],
		data: Vme.data.models.rfmos
	}),
	areaTypeStore:  new Ext.data.ArrayStore({
        id: 0,
        fields: [
            'id',
            'displayText'
        ],
		data: Vme.data.models.areaTypes
        
    }),
	VmeStatusStore: new Ext.data.ArrayStore({
        id: 0,
        fields: [
            'id',
            'displayText'
        ],
		data: Vme.data.models.VmeStatuses

    }),
	VmeCriteriaStore: new Ext.data.ArrayStore({
        id: 0,
        fields: [
            'id',
            'displayText'
        ],
		data: Vme.data.models.VmeCriteria

    }),    
	yearStore:  new Ext.data.ArrayStore({id:0,data: Vme.data.models.years,fields:['year']}),
	
	SearchResultStore:new Ext.ux.LazyJsonStore({
		//combo:this,
		method:'GET',
		
		root:'features',
		messageProperty: 'crs',
		autoLoad: false,
		fields: [
			{name: 'id', mapping: 'id'},
			{name: 'geometry', mapping: 'geometry'},
			{name: 'localname',  mapping: 'properties.LOCAL_NAME'},
			{name: 'bbox',		mapping: 'properties.bbox'},
			{name: 'vme_id',     mapping: 'properties.VME_ID'},
			{name: 'status', 	 mapping: 'properties.STATUS'},
			{name: 'year', mapping: 'properties.YEAR'},
			{name: 'type', mapping: 'properties.VME_TYPE'},
			{name: 'owner', mapping: 'properties.OWNER'},
			{name: 'geo_ref', mapping: 'properties.GEO_AREA'}
			
			
		],
		url: FigisMap.rnd.vars.ows,
		recordId: 'fid',
		paramNames:{
			start: "startindex",
			limit: "maxfeatures",
			sort: "sortBy"
		},
		baseParams:{
			service:'WFS',
			version:'1.0.0',
			request:'GetFeature',
			typeName: FigisMap.fifao.vme,
			outputFormat:'json',
			sortBy: 'VME_ID',
			srs:'EPSG:4326'
			
		
		},
		listeners:{
			beforeload: function(store){
				
			
			}
		}
		
		
		
	}),
	EncountersStore:new Ext.ux.LazyJsonStore({
		//combo:this,
		method:'GET',
		
		root:'features',
		messageProperty: 'crs',
		autoLoad: false,
		fields: [
			{name: 'id', mapping: 'fid'},
			{name: 'geometry', mapping: 'geometry'},
			{name: 'bbox',		mapping: 'properties.bbox'},
			{name: 'vme_id',     mapping: 'properties.VME_ID'},
			{name: 'taxa', 	 mapping: 'properties.TAXA'},
			{name: 'QUANTITY', mapping: 'properties.QUANTITY'},
			{name: 'unit', mapping: 'properties.UNIT'}

		],
		url: FigisMap.rnd.vars.ows,
		recordId: 'fid',
		paramNames:{
			start: "startindex",
			limit: "maxfeatures",
			sort: "sortBy"
		},
		baseParams:{
			service:'WFS',
			version:'1.0.0',
			request:'GetFeature',
			typeName: 'fifao:Encounters2',
			outputFormat:'json',
			sortBy: 'VME_ID',
			srs:'EPSG:4326'
			
		
		},
		listeners:{
			beforeload: function(store){
				
			
			}
		}
	}),
	SurveyDataStore:new Ext.ux.LazyJsonStore({
		//combo:this,
		method:'GET',
		
		root:'features',
		messageProperty: 'crs',
		autoLoad: false,
		fields: [
			{name: 'id', mapping: 'fid'},
			{name: 'geometry', mapping: 'geometry'},
			{name: 'bbox',		mapping: 'properties.bbox'},
			{name: 'vme_id',     mapping: 'properties.VME_ID'},
			{name: 'taxa', 	 mapping: 'properties.TAXA'},
			{name: 'QUANTITY', mapping: 'properties.QUANTITY'},
			{name: 'unit', mapping: 'properties.UNIT'}

		],
		url: FigisMap.rnd.vars.ows,
		recordId: 'fid',
		paramNames:{
			start: "startindex",
			limit: "maxfeatures",
			sort: "sortBy"
		},
		baseParams:{
			service:'WFS',
			version:'1.0.0',
			request:'GetFeature',
			typeName: 'fifao:SurveyData',
			outputFormat:'json',
			sortBy: 'VME_ID',
			srs:'EPSG:4326'
			
		
		},
		listeners:{
			beforeload: function(store){
				
			
			}
		}
	})

}
