var Vme={};

Vme.data={
	templates: {
		searchResult: 
				'<tpl for=".">'+
					'<div class="search-result">' +
						'<span class="ocean" >{ocean}</span> - '+'<span class="areatype" >{areatype}</span> - '+'<span class="area" >{area}</span> - '+'<span class="id" >{id}</span><br/>'+
						'<span class="source" style="font-weight:bold">{source}</span>'+
					'</div>'+
				'</tpl>'
	}
	

};
Vme.form={
	panels:{},
	widgets:{}
		
};


Vme.data.models = {
	rfmos : [['WCPFC','WCPFC'],['IATTC','IATTC'],['ICCAT','ICCAT'],['CCSBT','CCSBT'],['IOTC','IOTC']],
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
	SearchResultStore : new Ext.data.JsonStore({
		url: 'dummyData.js',
		
		fields: [
			'ocean', 'areatype', 'area', 'id', 'source'
		]
	})

}

Vme.form.widgets.SearchResults = new Ext.DataView({
	store: Vme.data.stores.SearchResultStore,
	tpl: Vme.data.templates.searchResult,
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
        if( window.console ) console.log('dataView.click(%o,%o,%o,%o)',view,index,node,event);
      },
      beforeclick: function(view,index,node,event){
        if( window.console ) console.log('dataView.beforeclick(%o,%o,%o,%o)',view,index,node,event);
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
			name: 'RFMO',
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
			valueType : 'id',
			displayField: 'displayText'
		},{
			fieldLabel: FigisMap.label('SEARCH_STAT_LBL')+' [<a href="#">?</a>]',
			name: 'status',
			ref: '../status',
			emptyText:  FigisMap.label('SEARCH_STAT_EMP'),
			allowBlank:true,
			forceSelection:true,
			typeAhead: true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.VmeStatusStore,
			valueType : 'id',
			displayField: 'displayText'
		},{
			fieldLabel: FigisMap.label('SEARCH_CRIT_LBL')+' [<a href="#">?</a>]',
			name: 'vmeCriteria',
			ref: '../vmeCriteria',
			emptyText:  FigisMap.label('SEARCH_CRIT_EMP')
		}, 
		{
			fieldLabel: FigisMap.label('SEARCH_YEAR_LBL') +'[<a href="#">?</a>]',
			name: 'year',
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
			handler: function(){
				Vme.data.stores.SearchResultStore.load();
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
							pageSize: 5,
							displayInfo: true,
							displayMsg: '',
							emptyMsg: "",
							listeners:{
								beforerender: function(){this.refresh.setVisible(false);}
								
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
	