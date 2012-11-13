var Vme={};

Vme.data={
	templates: {
		searchResult: 
				'<tpl for=".">'+
					'<div class="search-result" style="border-bottom:thin solid black">' +
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
	height:450,
	autoScroll:true,
	multiSelect: true,
	overClass:'x-view-over',
	itemSelector:'div.thumb-wrap',
	emptyText: 'Nothing to display',
	
		
		
});


Vme.form.panels.SearchForm = new Ext.FormPanel({
	labelWidth: 75, // label settings here cascade unless overridden
	//url:'save-form.php',
	bodyStyle:'padding:5px 5px 0',
	width: 200,
	labelAlign :'top',
	defaults: {width: 180},
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
			handler: function(){
				Vme.data.stores.SearchResultStore.load();
				Vme.form.panels.SearchPanel.layout.setActiveItem('searchcard-1');
			}
		},{
			text: 'Clear'
		}
	]
});

Vme.form.panels.SearchPanel = new Ext.Panel({
	title:'Search',
	layout:'card',
	activeItem: 0,
	height:550,
	
	defaults: {
		// applied to each contained panel
		border:false
	},
	items:[{
			id: 'searchcard-0',
			xtype:'panel',
			items:[Vme.form.panels.SearchForm]
		},{
			id: 'searchcard-1',
			xtype:'panel',
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
			buttons:[{
				xtype: 'tbbutton',
				text: '&laquo; Back to the search form',
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
	items:[{
			id:'legendpanel',
			title:'Legend',
			html:'<div id="legend" class="legend"></div>',
		},
		
		{	
			id:'layerswitcherpanel',
			title:'Layers',
			html:'<div id="layerswitcher"></div>',
		
		},Vme.form.panels.SearchPanel
		
	]

});
	