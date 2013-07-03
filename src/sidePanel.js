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
	height:470,
	autoScroll:true,
	//multiSelect: true,
	itemSelector:'div.search-result',
	itemCls: 'x-view-item',
	overClass:'x-view-over',
	selectedClass: 'x-view-selected',
	emptyText: FigisMap.label('SEARCH_NO_RES'),
	loadingText:FigisMap.label('SEARCH_LOADING'),
	listeners: {
      click: function(view,index,node,event){
          
        //if( window.console ) console.log('dataView.click(%o,%o,%o,%o)',view,index,node,event);
		var selectedRecord =this.store.getAt(index);
		var layer = myMap.getLayersByName("highlight")[0];
		//create layer
		if(layer){
			myMap.removeLayer(layer,false);
		}	

        var vmeId = 10; //selectedRecord.get("vmeId");
        var layerName = FigisMap.fifao.vme.split(':',2)[1];
        var featureid = layerName+'.'+vmeId;

        Ext.Ajax.request({
            url : FigisMap.rnd.vars.ows,
            method: 'GET',
            params :{
                service:'WFS',
                version:'1.0.0',
                request:'GetFeature',
                featureid: featureid,
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
                    var settings ={
                      zoomExtent: bounds.toBBOX(20)
                    }
                    zoomTo(settings,repro_bbox);
                    
                    //var year = selectedRecord.get("year");
                    var year = Ext.getCmp("id_selectYear").getValue() || selectedRecord.get("year");
                    var slider = Ext.getCmp('years-slider');
                    slider.setValue(year,true);
                    Ext.getCmp('years-min-field').setValue(year);
                    //TODO try use slider.updateVme();
                    FigisMap.ol.refreshFilters();
                    
                    myMap.getLayersByName("VME areas")[0].setVisibility(true);
                                
                    if(document.getElementById("SelectSRS").value == "4326"){
                        FigisMap.ol.emulatePopupFromGeom(geom);
                    }else{
                        FigisMap.ol.emulatePopupFromGeom(repro_geom);
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
		
      }
      ,beforeclick: function(view,index,node,event){
        //if( window.console ) console.log('dataView.beforeclick(%o,%o,%o,%o)',view,index,node,event);
      }
    }
	
		
		
});

/**
 * Vme.form.panels.SearchForm
 * form to perform searches on Vme search services (now to WFS) 
 * 
 */
Vme.form.panels.SearchForm = new Ext.FormPanel({
	labelWidth: 75, // label settings here cascade unless overridden

	bodyStyle:'padding:5px 5px 0',
	
	labelAlign :'top',
	defaults: {anchor:'100%' },
	defaultType: 'combo',
	items: [
		{
			fieldLabel: FigisMap.label("SEARCH_TEXT_LBL"),
			xtype: 'textfield',
			name : 'text',
			ref:'../text',
			emptyText: FigisMap.label("SEARCH_TEXT_EMP")
		},{
			fieldLabel: FigisMap.label('SEARCH_RFMO_LBL')+' [<a href="#">?</a>]',
			name: 'OWNER',
			ref:'../RFMO',
			emptyText:  FigisMap.label('SEARCH_RFMO_EMP'),
			store: Vme.data.stores.rfmoStore,
			allowBlank:true,
			forceSelection:true,
			triggerAction: 'all',
			mode: 'local',
            valueField : 'id',
			displayField: 'name'
		},{
			fieldLabel: FigisMap.label('SEARCH_TYPE_LBL')+' [<a href="#">?</a>]',
			name: 'VME_TYPE',
			ref: '../AreaType',
			emptyText:  FigisMap.label('SEARCH_TYPE_EMP'),
            value:   FigisMap.label('SEARCH_TYPE_EMP'),            
			allowBlank:true,
			forceSelection:true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.areaTypeStore,
			valueField : 'displayText',
			displayField: 'displayText'
		},
		{
			fieldLabel: FigisMap.label('SEARCH_CRIT_LBL')+' [<a href="#">?</a>]',
			name: 'vmeCriteria',
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
			fieldLabel: FigisMap.label('SEARCH_YEAR_LBL') +'[<a href="#">?</a>]',
			id: "id_selectYear",
			name: 'YEAR',
			ref:'../year', 
			emptyText:FigisMap.label('SEARCH_YEAR_EMP'),
			allowBlank:true,
			forceSelection:true,
			typeAhead: true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.yearStore,
			//valueType : 'id',
			displayField: 'year',
            valueField: 'year'
		}
	],

	buttons: [{
			text: FigisMap.label('SIDP_CLEAR'),
			ref: '../Clear',
			iconCls:'clear-icon',
			handler: function(){
				Vme.form.panels.SearchForm.getForm().reset();
			}
			
		},{
			text: FigisMap.label('SIDP_SEARCH'),
			ref: '../Search',
			iconCls: 'search-icon',
			
			createFilter: function(values){
				var query;
				
				for (var key in values){
					if (key != 'vmeCriteria') { //TODO
						if(query){
							query+= ' AND ';
							query+= ' ( '+ this.generateFilterComponent(key,values[key]) +' ) ';
						}else{
							query= ' ( '+ this.generateFilterComponent(key,values[key]) +' ) ';
						}

					}
				}
				return query;
			},
			generateFilterComponent:function(key,value){
				switch(key){
					case 'text':
						return 'LOCAL_NAME ILIKE \'%' + value + '%\''; 
					case 'VME_TYPE':
						return  'VME_TYPE ILIKE \'%' + value + '%\''; 
					case 'YEAR':
						return  'YEAR <= \''  + value + '\' AND END_YEAR > \''  + value + ' \''; 	
					default:
						return key + ' = \'' + value +'\'' ;
				}

			},
			handler: function(){
				var store = Vme.data.stores.SearchResultStore;
				store.resetTotal();
				store.removeAll();
				var query = this.createFilter(Vme.form.panels.SearchForm.getForm().getFieldValues(true));
				
				// TODO: do not use baseParams or the last search will be retained
				
				var fields = Vme.form.panels.SearchForm.getForm().getFieldValues(true);
				//console.log(fields);  // DEBUG
				for (var key in fields){
                    switch(key){
                        //case 'text':
                        //    return 'LOCAL_NAME ILIKE \'%' + value + '%\''; 
                        case 'OWNER':
                            store.setBaseParam("id_authority", fields[key]);
                            store.setBaseParam("authority", fields[key]);
                            break;
                        case 'VME_TYPE':
                            store.setBaseParam("id_vme_type", fields[key]);
                            store.setBaseParam("vme_type", fields[key]);
                            break;
                        case 'vmeCriteria':
                            store.setBaseParam("id_vme_criteria", fields[key]);
                            store.setBaseParam("vme_criteria", fields[key]);
                            break;
                        case 'YEAR':
                            store.setBaseParam("year", fields[key]);
                            break;
                        default:
                            break;
                    }
				}
				var params = {
					startindex: 0,          
					maxfeatures: Vme.data.constants.pageSize
				};
				
				if(query){
					store.setBaseParam("cql_filter", query);
					store.setBaseParam("srsName",'EPSG:4326');
				}else{
					if(store.baseParams["cql_filter"]){
						delete store.baseParams["cql_filter"];
					}
				}
				
				store.load({
					params: params
				});
				Vme.form.panels.SearchPanel.layout.setActiveItem('searchcard-1');
			}
		}
	]
});

/** 
 * Vme.form.panels.SearchPanel
 * panel containing search form and search results dataview using
 * card layout. Wraps the previous components to complete search GUI
 *
 */
Vme.form.panels.SearchPanel = new Ext.Panel({
	
	layout:'card',
	activeItem: 0,
	
	
	defaults: {
		border:false
	},
	items:[{
			id: 'searchcard-0',
			xtype:'panel',
			defaults: {
				border:false
			},
			items:[Vme.form.panels.SearchForm]
		},{
			id: 'searchcard-1',
			xtype:'panel',
			defaults: {
				border:false
			},
			items:[
				{
					xtype:'panel',
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
				handler: function(){Vme.form.panels.SearchPanel.layout.setActiveItem('searchcard-0')}
			}]
		}
	]
		
});


var sidePanel = new Ext.TabPanel({
	//applyTo: 'side-bar',
	//renderTo:'sidebar',
	height:550,
	autoTabs:true,
	activeTab:0,
	deferredRender:false,
	border:false,
	defaults:{
		border:false
	},
	items:[
		{
			layout:'fit',
			title:FigisMap.label('SIDP_MAP'),
			//activeItem: 'legendpanel',
			iconCls:'map-icon',			
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
			
			}/*,
			{
				id:'legendpanel',
				title:FigisMap.label('SIDP_LEGEND'),
				iconCls: 'legend-icon',	
				html:'<div id="legend" class="legend"></div>'
			}*/]
		},
		{
			title:FigisMap.label('SIDP_SEARCH'),
			iconCls: 'search-icon',
			items:[Vme.form.panels.SearchPanel]
		}
		
	]

});
