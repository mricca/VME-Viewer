/*
	side-panel.js
	Search module for VME using Extjs
	Authors: Lorenzo Natali. Geo-Solutions
	
	Status: Beta.	
*/

Vme.form={
	panels:{},
	widgets:{}
		
};

/**
 * Vme.form.widgets.SearchResults
 * Data view for search results. uses SearchResultStore and searchResult template
 */
Vme.form.widgets.SearchResults = new Ext.DataView({
	store: Vme.data.stores.SearchResultStore,
	tpl: Vme.data.templates.searchResult,
	pageSize:Vme.data.constants.pageSize,
	singleSelect: true,
	//height:440,
	autoScroll:true,
	//multiSelect: true,
	itemSelector:'div.search-result',
	itemCls: 'x-view-item',
	overClass:'x-view-over',
	selectedClass: 'x-view-selected',
	emptyText: FigisMap.label('SEARCH_NO_RES'),
	loadingText:FigisMap.label('SEARCH_LOADING'),
	listeners: {
    /*
      click: 
/*      ,beforeclick: function(view,index,node,event){
        //if( window.console ) console.log('dataView.beforeclick(%o,%o,%o,%o)',view,index,node,event);
      }*/
    }
	
		
		
});
/**
* clickOnResult
*/
Vme.clickOnFeature =function(geographicFeatureId,rec_year,zoom){
          
        //if( window.console ) console.log('dataView.click(%o,%o,%o,%o)',view,index,node,event);
		//var selectedRecord =this.store.getAt(index);
		var layer = myMap.getLayersByName("highlight")[0];
		//create layer
		if(layer){
			myMap.removeLayer(layer,false);
		}	

        var vmeId = 103; //selectedRecord.get("vmeId");
        //var geographicFeatureId = selectedRecord.get("geographicFeatureId");
        // vecchi parametri
        var layerName = FigisMap.fifao.vme.split(':',2)[1];
        var featureid = layerName+'.'+vmeId;
        //nuovi parametri
        var typename = FigisMap.fifao.vme;
        var CQL_FILTER = "VME_AREA_TIME = '"+geographicFeatureId+"'";


        Ext.Ajax.request({
            url : FigisMap.rnd.vars.ows,
            method: 'GET',
            params :{
                service:'WFS',
                version:'1.0.0',
                request:'GetFeature',
                //featureid: featureid,
                typename: typename,
                cql_filter: CQL_FILTER,
                outputFormat:'json'
            },
            success: function ( result, request ) {
                var jsonData = Ext.util.JSON.decode(result.responseText);
                
                if (!jsonData.features || jsonData.features.length <= 0 || !jsonData.features[0].geometry){
                    Ext.MessageBox.show({
                        title: "Info",
                        msg: FigisMap.label("SIDP_NOGEOMETRY"),
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.INFO,
                        scope: this
                    });  
                }else{      
                    var geoJsonGeom = jsonData.features[0].geometry;
                    var projcode = "EPSG:4326";
                    var GeoJsonFormat = new OpenLayers.Format.GeoJSON();
    
                    var geom = GeoJsonFormat.read(geoJsonGeom, "Geometry");
                    
                    layer = new OpenLayers.Layer.Vector("highlight",{
                            displayInLayerSwitcher: false
                    });
                    var repro_geom = geom.clone().transform(
                        new OpenLayers.Projection(projcode),
                        myMap.getProjectionObject()
                    );
                    layer.addFeatures(new OpenLayers.Feature.Vector(repro_geom));
                    myMap.addLayer(layer);
                    var bounds = geom.clone().getBounds();
                    var repro_bbox = repro_geom.getBounds();
                    
                    myMap.getLayersByName("VME areas")[0].setVisibility(false);
                    
                    if(Ext.isIE){
                      myMap.zoomOut(); 
                    }
                    
                    var settings = {
                      zoomExtent: bounds.toBBOX(20)
                    };
                    
					zoomTo(settings,repro_bbox,zoom);
                    
                    myMap.paddingForPopups.right = 240; //TODO use this to center the popup when the search panel is opened!!! <--
                    
                    //var year = selectedRecord.get("year");
                    var year = Ext.getCmp("id_selectYear").getValue() || rec_year;
                    /*
                    var slider = Ext.getCmp('years-slider');
                    slider.setValue(year,true);
                    Ext.getCmp('years-min-field').setValue(year);
                    */
                    FigisMap.ol.setSelectedYear(year);
                    //TODO try use slider.updateVme();

                    FigisMap.ol.refreshFilters();
                    
                    myMap.getLayersByName("VME areas")[0].setVisibility(true);
                    if(!zoom){            
                        if(getProjection() == "4326"){
                            FigisMap.ol.emulatePopupFromGeom(geom);
                        }else{
                            FigisMap.ol.emulatePopupFromGeom(repro_geom);
                        }
                    }
                }
          
            },
            failure: function ( result, request ) {
                Ext.MessageBox.show({
                    title: "Info",
                    msg: FigisMap.label("SIDP_NOGEOMETRY"),
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.INFO,
                    scope: this
                });  
            },
            scope: this
        });
		
      };

/**
 * Vme.form.panels.SearchForm
 * form to perform searches on Vme search services (now to WFS) 
 * 
 */
Vme.form.panels.SearchForm = new Ext.FormPanel({
	labelWidth: 75, // label settings here cascade unless overridden

	bodyStyle:'padding:5px 5px 0',
	border: false,
	labelAlign :'top',
	defaults: {
	    anchor:'100%',
        shadow:false
    },
	defaultType: 'combo',
    id:'SearchForm',
	items: [
		/*{
			fieldLabel: FigisMap.label("SEARCH_TEXT_LBL"),
			xtype: 'textfield',
			name : 'text',
			ref:'../text',
			emptyText: FigisMap.label("SEARCH_TEXT_EMP")
		},*/{
			fieldLabel: FigisMap.label('SEARCH_RFMO_LBL'),//+' [<a href="#">?</a>]',
			name: 'authority',
			ref:'../RFMO',
			id: "RFMOCombo",
			emptyText:  FigisMap.label('SEARCH_RFMO_EMP'),
			store: Vme.data.stores.rfmoStore,
			allowBlank:true,
			forceSelection:true,
			triggerAction: 'all',
			mode: 'local',
            valueField : 'id',
			displayField: 'acronym'
		},{
			fieldLabel: FigisMap.label('SEARCH_TYPE_LBL'),//+' [<a href="#">?</a>]',
			name: 'vme_type',
			ref: '../AreaType',
			emptyText:  FigisMap.label('SEARCH_TYPE_EMP'),
            value:   FigisMap.label('SEARCH_TYPE_EMP'),            
			allowBlank:true,
			forceSelection:true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.areaTypeStore,
			valueField : 'id',
			displayField: 'displayText',
			listAlign: ['tr-br?', [17,0]],
			listeners:{
			    expand:{
			        single:true,
			        fn: function( comboBox ){
                          comboBox.list.setWidth( 'auto' );
                          comboBox.innerList.setWidth( 'auto' );
                        }
			    }
			}
		},
		{
			fieldLabel: FigisMap.label('SEARCH_CRIT_LBL'),//+' [<a href="#">?</a>]',
			name: 'vme_criteria',
			ref: '../vmeCriteria',
			emptyText:  FigisMap.label('SEARCH_CRIT_EMP'),
			value:   FigisMap.label('SEARCH_CRIT_EMP'),   
			allowBlank:true,
			forceSelection:true,
			typeAhead: true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.VmeCriteriaStore,
			valueField : 'id',
			displayField: 'displayText'			
		}, 
		{
			fieldLabel: FigisMap.label('SEARCH_YEAR_LBL'),//+'[<a href="#">?</a>]',
			id: "id_selectYear",
			name: 'year',
			ref:'../year', 
			emptyText:FigisMap.label('SEARCH_YEAR_EMP'),
			allowBlank:true,
			forceSelection:true,
			typeAhead: true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.yearStore,
			displayField: 'year',
            valueField: 'year'
		}
	],

	buttons: [{
			text: FigisMap.label('SIDP_CLEAR'),
			ref: '../Clear',
			cls:'figisButton',
			handler: function(){
				Vme.form.panels.SearchForm.getForm().reset();
				document.getElementById('searchtext').value = "";
			}
			
		},{
			text: FigisMap.label('SIDP_SEARCH'),
			ref: '../Search',
			cls: 'figisButton',
			
			handler: function(){
                Vme.search(true);
            }
		}
	],
    listeners: {
        afterRender: function(thisForm, options){
            this.keyNav = new Ext.KeyNav( this.el, {                  
                "enter": this.Search.handler,
                scope: this
            });
        }
    } 
});

/**
 * Vme.search
 * Search VMEs zooming to the VME autority area.
 * 
 */
Vme.search = function(advanced){

	// ///////////////////////////////////////////////////
	// Retrieve Autority area extent to perform a zoomTo.
	// ///////////////////////////////////////////////////
	
	var RFMOCombo = Ext.getCmp("RFMOCombo");
	var RFMStore = RFMOCombo.getStore();
	var value = RFMOCombo.getValue();
	
	var dIndex = RFMStore.find("id", value);
	if(dIndex > -1){
		var r = RFMStore.getAt(dIndex);	
		var rfmName = r.data.acronym;
		
		var filter = new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: FigisMap.rnd.vars.vmeSearchZoomTo.filterProperty,    // "RFB",
			value: rfmName
		});
		
		var protocol = new OpenLayers.Protocol.WFS({
		   version: FigisMap.rnd.vars.vmeSearchZoomTo.wfsVersion,          // "1.1.0",					
		   url: FigisMap.rnd.vars.vmeSearchZoomTo.wfsUrl,                  // "http://figisapps.fao.org/figis/geoserver/" + "wfs",									   
		   featureType: FigisMap.rnd.vars.vmeSearchZoomTo.featureType,     // "RFB_COMP",
		   featurePrefix: FigisMap.rnd.vars.vmeSearchZoomTo.featurePrefix, // "fifao",
		   srsName: FigisMap.rnd.vars.vmeSearchZoomTo.srsName,             // "EPSG:4326",
		   defaultFilter: filter
		});
		
		var mask = new Ext.LoadMask(Ext.getBody(), {msg: "Please wait ..."});
		
		var callback = function(r) {
			var features = r.features;
			
			if(!features || features.length < 1){
				mask.hide();
				
				Ext.MessageBox.show({
					title: "Info",
					msg: FigisMap.label("SIDP_NOFEATURES"),
					buttons: Ext.Msg.OK,
					icon: Ext.MessageBox.WARNING,
					scope: this
				});
			}
					
			// ///////////////////////////
			// Get the bigger extent
			// ///////////////////////////
			var size = features.length;
			var bounds = features[0].bounds;
			for(var i=1; i<size; i++){
				var b = features[i].bounds;
				if(!b){
					continue;
				}
				if(bounds && b.contains(bounds)){
					bounds = b;
				}			
			}
			
			//var test = new OpenLayers.Layer.Vector("test", {
			//		displayInLayerSwitcher: true
			//});
			
			var repro_geom = bounds.toGeometry().transform(
				new OpenLayers.Projection(FigisMap.rnd.vars.vmeSearchZoomTo.srsName),
				myMap.getProjectionObject()
			);
			
			//test.addFeatures(new OpenLayers.Feature.Vector(repro_geom));	
			//myMap.addLayers([test]);
			
			var repro_bbox = repro_geom.getBounds();
			var settings = {
				zoomExtent: bounds.toBBOX(20)
			};
			
			zoomTo(settings, repro_bbox, true);
			
			vmeSearch(advanced);
			
			mask.hide();
		};
		
		mask.show();
		var response = protocol.read({
			callback: callback
		});	
	}else{
		vmeSearch(advanced);
	}
};

function vmeSearch(advanced){
	// ///////////////////
	// Perform search
	// ///////////////////
	var store = Vme.data.stores.SearchResultStore;
	store.resetTotal();
	store.removeAll();
	store.baseParams={};
	var fields = {};
	if(advanced){
		var fields = Vme.form.panels.SearchForm.getForm().getFieldValues(true);
	}
	fields.text = document.getElementById('searchtext').value;
	var params = {
		start: 0,          
		rows: Vme.data.constants.pageSize
	};
	
	for (var key in fields){
		if(fields[key]!=""){
			switch(key){
				case 'authority':
				case 'vme_type':
				case 'vme_criteria':
				case 'year':
				case 'text':
					store.setBaseParam(key, fields[key]);
					break;
				default:
					break;
			}
		}
	}
	
	store.load({
		params: params
	});
	
	Vme.form.panels.SearchPanel.layout.setActiveItem('resultPanel');
}

/** 
 * Vme.form.panels.SearchPanel
 * panel containing search form and search results dataview using
 * card layout. Wraps the previous components to complete search GUI
 *
 */
Vme.form.panels.SearchPanel = new Ext.Panel({
	
	layout:'card',
	activeItem: 0,
	
	border: false,
	defaults: {
		border:false
	},
	items:[{
			id: 'searchForm',
			xtype:'panel',
            border: false,
			defaults: {
				border:false
			},
			items:[Vme.form.panels.SearchForm]
		},{
			id: 'resultPanel',
			xtype:'panel',
			defaults: {
				border:false
			},
			items:[
				{
                    height:460,
                    border: false,
					xtype:'panel',
                    layout:'fit',
					items:[Vme.form.widgets.SearchResults],
					bbar : new Ext.ux.LazyPagingToolbar({
							store: Vme.data.stores.SearchResultStore,
							pageSize: Vme.data.constants.pageSize
					})	
			}],
			bbar:[{
				xtype: 'button',
				text: FigisMap.label('SEARCH_BACK_FORM'),
				iconCls: 'back-search-icon',
				handler: function(){Vme.form.panels.SearchPanel.layout.setActiveItem('searchForm');}
			}]
		}
	]
		
});


var sidePanel = new Ext.Panel({
	//applyTo: 'side-bar',
	//renderTo:'sidebar',
    collapsed:true,
    collapsible:false,
	height:460,	
	activeItem: 0,
    layout:'card',
	deferredRender:false,
	border:false,
	defaults:{
		border:false
	},
	items:[
		{
			xtype: "form",
			id: "embed-link",
			bodyStyle: 'padding:5px 5px 0',
			border: false,
			labelAlign :'top',
			defaults: {
				anchor: '100%',
				shadow: false
			},
			items:[
				{
					xtype: "textfield",
					id: "embed-url",
					selectOnFocus: true,
					fieldLabel: "Paste the link in mail or chat"					
				},
				{
					xtype: "textfield",
					id: "embed-iframe",
					selectOnFocus: true,
					fieldLabel: "Paste the HTML in a web site"					
				}
			]
		},
		{
            id: 'legendPanel',
			layout:'fit',
			//title:FigisMap.label('SIDP_MAP'),
			//iconCls:'map-icon',			
			renderHidden:true,
			defaults:{
				border:false
			},
			items:[{	
				id:'layerswitcherpanel',
				//title:FigisMap.label('SIDP_LAYERS'),
				iconCls: 'layers-icon',
				autoScroll: true,
				html:'<div id="layerswitcher"></div>'
			
			}]
		},
		{
            id: 'searchPanel',
			//title:FigisMap.label('SIDP_SEARCH'),
			iconCls: 'search-icon',
			items:[Vme.form.panels.SearchPanel]
		}
		
	]

});
