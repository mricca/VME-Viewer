var Vme={};

Vme.data={
	templates: {
		searchResult: 
				new Ext.XTemplate(
				'<tpl for=".">'+
					'<div class="search-result">' +
						'<span class="localname" >{[this.writeStatus(values.status)]}</span> {year} - '+'<span class="areatype" >{Terr_Name}</span> - '+'<span class="id" >{vme_id}</span><br/>'+
						'<span class="source" style="font-weight:bold">Vulnerable Marine Ecosystem Database</span>'+
					'</div>'+
				'</tpl>',{
				compiled:true,
				writeStatus:function(status){
					var statusRecord=  Vme.data.stores.VmeStatusStore.getById(status);
					var text =statusRecord ? statusRecord.get('displayText'):status;
					return text;
				}

				})
	},
	constants:{
		pageSize:10
	}
	

};
Vme.form={
	panels:{},
	widgets:{}
		
};


Vme.data.models = {
	rfmos : [['NAFO','NAFO'],['NEAFC','NEAFC'],['CCAMLR','CCAMLR']],
	areaTypes : [
		[0, FigisMap.label('VME_TYPE_ALL')],
		[1, FigisMap.label('VME_TYPE_VME')],
		[2, FigisMap.label('VME_TYPE_RISK')],
		[3, FigisMap.label('VME_TYPE_BPA')],
		[4, FigisMap.label('VME_TYPE_CLOSED')],
		[5, FigisMap.label('VME_TYPE_OTHER')]
	],
	VmeStatuses:[ 
		[0, FigisMap.label("VME_STATUS_ALL")],
		[1, FigisMap.label("VME_STATUS_ENS")],
		[2, FigisMap.label("VME_STATUS_UNDEST")],
		[3, FigisMap.label("VME_STATUS_RISK")],
		[4, FigisMap.label("VME_STATUS_VOL")],
		[5, FigisMap.label("VME_STATUS_EXP")],
		[6, FigisMap.label("VME_STATUS_POT")],
		[7, FigisMap.label("VME_STATUS_TEMP")]
		
	],
	years : (function(){var currentTime = new Date();var now=currentTime.getFullYear();var year=2000;var ret=[];while(year<=now){ret.push([now]);now--;}return ret;})() 

};
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
	yearStore:  new Ext.data.ArrayStore({id:0,data: Vme.data.models.years,fields:['year']}),
	/*SearchResultStore : new Ext.data.JsonStore({
		url: 'dummyData.js',
		
		fields: [
			'ocean', 'areatype', 'area', 'id', 'source'
		]
	})*/
	SearchResultStore:new Ext.data.JsonStore({
		//combo:this,
		method:'GET',
		
		root:'features',
		messageProperty: 'crs',
		autoLoad: false,
		fields: [
			{name: 'id', mapping: 'fid'},
			{name: 'geometry', mapping: 'geometry'},
			{name: 'localname',  mapping: 'properties.Terr_Name'},
			{name: 'bbox',		mapping: 'properties.bbox'},
			{name: 'vme_id',     mapping: 'properties.VME_ID'},
			{name: 'status', 	 mapping: 'properties.STATUS'},
			{name: 'year', mapping: 'properties.YEAR'},
			
		],
		url: 'http://office.geo-solutions.it/figis/geoserver/fifao/ows',
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
			typeName: 'fifao:Vme',
			outputFormat:'json',
			sortBy: 'VME_ID',
			srs:'EPSG:4326'
			
		
		},
		listeners:{
			beforeload: function(store){
			
			
			}
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
				var current = o.totalRecords +  options.params[store.paramNames.start] ;
				var currentCeiling = options.params[store.paramNames.start] + options.params[store.paramNames.limit];
				if(current < currentCeiling){
					return current;
				}else{
					return 100000000000000000; 
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
		
	})

}

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
	listeners: {
      click: function(view,index,node,event){
        //if( window.console ) console.log('dataView.click(%o,%o,%o,%o)',view,index,node,event);
		var selectedRecord =this.store.getAt(index);
		var layer = myMap.getLayersByName("hilights")[0];
		//create layer
		if(layer){
			myMap.removeLayer(layer,false);
		}	
		var projcode = "EPSG:4326";
		var GeoJsonFormat = new OpenLayers.Format.GeoJSON();
		var geoJsonGeom= selectedRecord.get("geometry");
		var geom = GeoJsonFormat.read(geoJsonGeom, "Geometry");
		
		var center = geom.getCentroid();
				center = center.clone().transform(
					new OpenLayers.Projection(projcode),
					myMap.getProjectionObject()
				);
		center = new OpenLayers.LonLat(center.x, center.y);
		var bounds = geom.getBounds().transform(
						new OpenLayers.Projection(projcode),
						myMap.getProjectionObject()
		);
		layer = new OpenLayers.Layer.Vector("hilights",{
				displayInLayerSwitcher: false
		});
		layer.addFeatures(new OpenLayers.Feature.Vector(geom));
		myMap.addLayer(layer);
		myMap.zoomToExtent(bounds);
		var year = selectedRecord.get("year");
		var slider = Ext.getCmp('years-slider');
		slider.setValue(year,true);
		Ext.getCmp('years-min-field').setValue(year);
		//TODO try use slider.updateVme();
		 myMap.getLayersByName('Established VME areas')[0].mergeNewParams({'CQL_FILTER': "YEAR = '" + year + "'"});
        
        if (FigisMap.rnd.status.logged == true){
            myMap.getLayersByName('Encounters')[0].mergeNewParams({'CQL_FILTER': "YEAR = '" + year + "'"});
            myMap.getLayersByName('Encounters')[0].redraw(true);
            
            myMap.getLayersByName('SurveyData')[0].mergeNewParams({'CQL_FILTER': "YEAR = '" + year + "'"});
            myMap.getLayersByName('SurveyData')[0].redraw(true); 
        }
		
		
      },
      beforeclick: function(view,index,node,event){
        //if( window.console ) console.log('dataView.beforeclick(%o,%o,%o,%o)',view,index,node,event);
      }
    }
	
		
		
});


Vme.form.panels.SearchForm = new Ext.FormPanel({
	labelWidth: 75, // label settings here cascade unless overridden
	//url:'save-form.php',
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
			name: 'VME_ID',
			ref:'../RFMO',
			emptyText:  FigisMap.label('SEARCH_RFMO_EMP'),
			store: Vme.data.stores.rfmoStore,
			allowBlank:true,
			forceSelection:true,
			triggerAction: 'all',
			mode: 'local',
			displayField: 'name'
		},{
			fieldLabel: FigisMap.label('SEARCH_TYPE_LBL')+' [<a href="#">?</a>]',
			name: 'AreaType',
			ref: '../AreaType',
			emptyText:  FigisMap.label('SEARCH_TYPE_EMP'),
			allowBlank:true,
			forceSelection:true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.areaTypeStore,
			valueField : 'id',
			displayField: 'displayText'
		},{
			fieldLabel: FigisMap.label('SEARCH_STAT_LBL')+' [<a href="#">?</a>]',
			name: 'STATUS',
			ref: '../status', 
			emptyText:  FigisMap.label('SEARCH_STAT_EMP'),
			allowBlank:true,
			forceSelection:true,
			typeAhead: true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.VmeStatusStore,
			valueField : 'id',
			displayField: 'displayText'
		},{
			fieldLabel: FigisMap.label('SEARCH_CRIT_LBL')+' [<a href="#">?</a>]',
			name: 'vmeCriteria',
			ref: '../vmeCriteria',
			emptyText:  FigisMap.label('SEARCH_CRIT_EMP')
		}, 
		{
			fieldLabel: FigisMap.label('SEARCH_YEAR_LBL') +'[<a href="#">?</a>]',
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

	buttons: [
		{
			text: FigisMap.label('SIDP_SEARCH'),
			ref: '../Search',
			iconCls: 'search-icon',
			createFilter: function(values){
				var query;
				for (var key in values){
					if(query){
						query+= ' AND ';
						query+= ' ( '+ this.generateFilterComponent(key,values[key]) +' ) ';
					}else{
						query= ' ( '+ this.generateFilterComponent(key,values[key]) +' ) ';;
					}
					
				}
				return query;
			},
			generateFilterComponent:function(key,value){
				if (key == 'VME_ID') return key + ' LIKE \'%' + value +'%\'' ;
				else return key + ' = ' + value ;

			},
			handler: function(){
				Vme.data.stores.SearchResultStore.removeAll();
				var query = this.createFilter(Vme.form.panels.SearchForm.getForm().getFieldValues(true));
				var params = {
					startindex: 0,          
					maxfeatures: Vme.data.constants.pageSize,
					srsName:	myMap.getProjection() || 'EPSG:4326',
	
				};
				if(query){
					params.cql_filter = query;
				}
				Vme.data.stores.SearchResultStore.load({
					params: params
				});
				Vme.form.panels.SearchPanel.layout.setActiveItem('searchcard-1');
			}
		},{
			text: FigisMap.label('SIDP_CLEAR'),
			ref: '../Clear',
			iconCls:'clear-icon',
			handler: function(){
				Vme.form.panels.SearchForm.getForm().reset();
			}
			
		}
	]
});

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
					bbar : new Ext.PagingToolbar({
							store: Vme.data.stores.SearchResultStore,
							pageSize: Vme.data.constants.pageSize,
							displayInfo: true,
							displayMsg: "",
							emptyMsg: "",
							afterPageText:"",
							beforePageText:"",
							listeners:{
								beforerender: function(){this.refresh.setVisible(false);this.last.setVisible(false);}
								
							}
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
			layout:'accordion',
			title:FigisMap.label('SIDP_MAP'),
			activeItem: 'legendpanel',
			iconCls:'map-icon',			
			renderHidden:true,
			defaults:{
				border:false
			},
			items:[{	
				id:'layerswitcherpanel',
				title:FigisMap.label('SIDP_LAYERS'),
				iconCls: 'layers-icon',
				html:'<div id="layerswitcher"></div>'
			
			},
			{
				id:'legendpanel',
				title:FigisMap.label('SIDP_LEGEND'),
				iconCls: 'legend-icon',	
				html:'<div id="legend" class="legend"></div>'
			}]
		},
		{
			title:FigisMap.label('SIDP_SEARCH'),
			iconCls: 'search-icon',
			items:[Vme.form.panels.SearchPanel]
		}
		
	]

});
	