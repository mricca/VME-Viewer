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
	rfmos : [['WCPFC','WCPFC'],['IATTC','IATTC'],['ICCAT','ICCAT'],['CCSBT','CCSBT'],['IOTC','IOTC'],['WCPFC','WCPFC']],
	areaTypes : [[0,'All'],[1,'VME'],[2,'Risk Area'], [3,'Benthic protext area'],[4, 'Closed area'],[5,'Other types of managed areas']],
	VmeStatuses:[ 
		[0, 'All'],
		[1, 'Established',],
		[2, 'Under establishment'],
		[3, 'Risk' ],
		[4, 'Voluntary'],
		[5,	'Exploratory'],
		[6, 'Potential'],
		[7, 'Temporary ']
		
	],
	years : (function(){var currentTime = new Date();var now=currentTime.getFullYear();var year=1960;var ret=[];while(year<now+1){ret.push([year,''+year]);year++;}return ret;})()

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
		data: Vme.data.models.areaTypes,
        fields: [
            'id',
            'displayText'
        ],
        
    }),
	VmeStatusStore: new Ext.data.ArrayStore({
        id: 0,
		data: Vme.data.models.VmeStatuses,
        fields: [
            'id',
            'displayText'
        ],

    }),
	yearStore:  new Ext.data.ArrayStore({id:0,data: Vme.data.models.years,fields:['year','yeartext']}),
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
	height:450,
	autoScroll:true,
	//multiSelect: true,
	itemSelector:'div.search-result',
	itemCls: '.x-view-item',
	overClass:'x-view-over',
	selectedClass: 'x-view-selected'
	emptyText: 'Nothing to display',
	listeners: {
      click: function(view,index,node,event){
        if( window.console ) console.log('dataView.click(%o,%o,%o,%o)',view,index,node,event);
      },
      beforeclick: function(view,index,node,event){
        if( window.console ) console.log('dataView.beforeclick(%o,%o,%o,%o)',view,index,node,event);
      },
    },
	
		
		
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
			fieldLabel:'Text',
			xtype: 'textfield',
			name : 'text',
			ref:'../text',
			emptyText:'Free Text...'
		},{
			fieldLabel: 'By RFMO and other institutions [<a href="#">?</a>]',
			name: 'RFMO',
			ref:'../RFMO',
			emptyText:'Select...',
			store: Vme.data.stores.rfmoStore,
			allowBlank:true,
			forceSelection:true,
			triggerAction: 'all',
			mode: 'local',
			displayField: 'name'
		},{
			fieldLabel: 'By Area Type [<a href="#">?</a>]',
			name: 'AreaType',
			ref: '../AreaType',
			emptyText:'Select...',
			allowBlank:true,
			forceSelection:true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.areaTypeStore,
			valueType : 'id',
			displayField: 'displayText'
		},{
			fieldLabel: 'By Status [<a href="#">?</a>]',
			name: 'status',
			ref: '../status',
			emptyText:'Select...',
			allowBlank:true,
			forceSelection:true,
			typeAhead: true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.VmeStatusStore,
			valueType : 'id',
			displayField: 'displayText'
		},{
			fieldLabel: 'By VME Criteria [<a href="#">?</a>]',
			name: 'vmeCriteria',
			ref: '../vmeCriteria',
			emptyText:'Select...'
		}, 
		{
			fieldLabel: 'By Year [<a href="#">?</a>]',
			name: 'year',
			ref:'../year',
			emptyText:'Select Year',
			allowBlank:true,
			forceSelection:true,
			typeAhead: true,
			triggerAction: 'all',
			mode: 'local',
			store:  Vme.data.stores.yearStore,
			valueType : 'id',
			displayField: 'year',
            valueField: 'yearText',
		}
	],

	buttons: [
		{
			text: 'Search',
			ref: '../Search',
			iconCls: 'search-icon',
			handler: function(){
				Vme.data.stores.SearchResultStore.load();
				Vme.form.panels.SearchPanel.layout.setActiveItem('searchcard-1');
			}
		},{
			text: 'Clear',
			iconCls:'clear-icon'
			
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
					bbar :[ new Ext.PagingToolbar({
							store: Vme.data.stores.SearchResultStore,
							pageSize: 5,
							displayInfo: true,
							displayMsg: '',
							emptyMsg: ""
						})
					]
			}],
			bbar:[{
				xtype: 'button',
				text: '&laquo; Back to the search form',
				iconCls: 'back-search-icon',
				handler: function(){Vme.form.panels.SearchPanel.layout.setActiveItem('searchcard-0')}
			}],
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
			title:'Map',
			activeItem: 'legendpanel',
			iconCls:'map-icon',			
			renderHidden:true,
			defaults:{
				border:false
			},
			items:[{	
				id:'layerswitcherpanel',
				title:'Layers',
				iconCls: 'layers-icon',
				html:'<div id="layerswitcher"></div>',
			
			},
			{
				id:'legendpanel',
				title:'Legend',
				iconCls: 'legend-icon',	
				html:'<div id="legend" class="legend"></div>',
			}]
		},
		{
			title:'Search',
			iconCls: 'search-icon',
			items:[Vme.form.panels.SearchPanel]
		}
		
	]

});
	