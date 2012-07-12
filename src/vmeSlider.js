var FigisMap;

Ext.onReady(function(){
	
    new Ext.Panel({
        id:'main-panel',
        baseCls:'x-plain',
        renderTo: "vme_slider",
        layout:'fit',
        width : 815,
        defaults: {frame:false, header: false},
        items:[
            {
                height:40,
                layout:'hbox',
                border : false,
                layoutConfig: {
                  border: false
                },
                items: [
                    new Ext.Button({
                        tooltip: "First year",
                        tooltipType: 'title',
                        id: "first-year",
                        iconCls: "first-year",
                        handler: function(){
                            var years = Ext.getCmp('years-slider');	
                            var yr_end = years.getValues()[0];
                            
                            years.setValue(0, '2007');
                            Ext.getCmp('years-min-field').setValue('2007');
                            
                            issueUpdate();
                        }
                    }),
                    new Ext.Button({
                        tooltip: "Large interval decrement",
                        tooltipType: 'title',
                        id: "year-min-largestep",
                        iconCls: "year-min-largestep",
                        handler: function(){
                            var years = Ext.getCmp('years-slider');	
                            var yr_end = years.getValues()[0];
                            
                            years.setValue(0, yr_end-2);                            
                            Ext.getCmp('years-min-field').setValue(years.getValues()[0]);

                            issueUpdate();
                        }
                    }),
                    new Ext.Button({
                        tooltip: "Small interval decrement",
                        tooltipType: 'title',
                        id: "year-min-littlestep",
                        iconCls: "year-min-littlestep",
                        handler: function(){
                            var years = Ext.getCmp('years-slider');	
                            var yr_end = years.getValues()[0];
                            
                            years.setValue(0, yr_end-1);
                            Ext.getCmp('years-min-field').setValue(years.getValues()[0]);

                            issueUpdate();
                        }
                    }), 
                    {
                        id : 'years-min-field',
                        xtype: 'textfield',
                        readOnly: true,
                        width: 40,
                        value: '2007' //new Date().getFullYear() - 1
                    },
                    new Ext.slider.SingleSlider({
                        id : 'years-slider',
                        vertical : false,
                        width   : 600,
                        minValue: 2007,
                        maxValue: new Date().getFullYear(),
                        values  : ['2007'],
                        plugins : new Ext.slider.Tip({
                            getText: function(thumb){
                                return String.format('<b>{0}</b>', thumb.value);
                            }
                        }),
                        listeners: {
                            changecomplete : function (){

                                issueUpdate();
                                
                                Ext.getCmp('years-min-field').setValue(this.getValues()[0]);
                                Ext.getCmp('years-max-field').setValue(new Date().getFullYear());
                            }
                        }
                    }),
                    {
                        id : 'years-max-field',
                        xtype: 'textfield',
                        readOnly: true,
                        width: 40,
                        value: new Date().getFullYear()
                    },
                    new Ext.Button({
                        tooltip: "Small interval increment",
                        tooltipType: 'title',
                        id: "year-max-littlestep",
                        iconCls: "year-max-littlestep",
                        handler: function(){
                            var years = Ext.getCmp('years-slider');	
                            var yr_start = years.getValues()[0];
                            
                            years.setValue(0, yr_start+1);
                           
                            Ext.getCmp('years-min-field').setValue(years.getValues()[0]);

                            issueUpdate();

                        }
                    }),				
                    new Ext.Button({
                        tooltip: "Large interval increment",
                        tooltipType: 'title',
                        id: "year-max-largestep",
                        iconCls: "year-max-largestep",
                        handler: function(){
                            var years = Ext.getCmp('years-slider');	
                            var yr_start = years.getValues()[0];
                            
                            years.setValue(0, yr_start+2);
                            
                            Ext.getCmp('years-min-field').setValue(years.getValues()[0]);
                              
                            issueUpdate();

                        }
                    }),
                    new Ext.Button({
                        tooltip: "Last year",
                        tooltipType: 'title',
                        id: "last-year",
                        iconCls: "last-year",
                        handler: function(){
                            var years = Ext.getCmp('years-slider');	
                            var yr_start = years.getValues()[0];

                            years.setValue(0, new Date().getFullYear());

                            Ext.getCmp('years-min-field').setValue(new Date().getFullYear());

                            issueUpdate();

                        }
                    })
                ]
            }
        ]
    });
    
    function issueUpdate(){
		//alert(FigisMap.fifao.vme);
        Ext.getCmp('years-slider').disable();
        Ext.getCmp("year-min-largestep").disable(); 
        Ext.getCmp("year-min-littlestep").disable(); 
        Ext.getCmp("year-max-littlestep").disable(); 
        Ext.getCmp("year-max-largestep").disable(); 
          
        //tuna_map.mergeNewParams({'viewparams':getViewParams()});
        /*
        var legendParams = [
          "REQUEST=GetLegendGraphic",
          "LAYER=fifao:TUNA_YEARLY_CATCHES",
          "WIDTH=20",
          "HEIGHT=20",
          "format=image/png",
          "viewparams=" + getViewParams()
        ];
        
        document.getElementById('legendTunaAtlas').innerHTML = 
          '<img alt="" src="' + Tuna.vars.wms + '?' + legendParams.join('&')+'">';
          
        document.getElementById('nodelist').innerHTML = '';
        document.getElementById('brkdwn_nodelist').innerHTML = '';
        	
        params = "null";
        brkdwn_params = "null";
        
        //
        // Filling map information table 
        // 
        document.getElementById('tabspecies').innerHTML = selectedSpecies.join(',');
        document.getElementById('tabgears').innerHTML = selectedGears.join(',');
        
        var quarters = Ext.getCmp('quarter-slider');	
        var qt_start = quarters.getValues()[0];
        var qt_end = quarters.getValues()[1];
        
        var qt_ta = '';
        
        for(var q = 0; q <= (qt_end - qt_start ); q++) {
          qt_ta += (qt_start + q) + (q <= (qt_end - qt_start)-1 ? ',' : '');
        }
        
        document.getElementById('tabquarters').innerHTML = qt_ta;
        */
        var years = Ext.getCmp('years-slider');	
        var yr_start = years.getValues()[0];
        var yr_end = years.getValues()[1];


        Ext.getCmp('years-slider').enable();
        Ext.getCmp("year-min-largestep").enable(); 
        Ext.getCmp("year-min-littlestep").enable(); 
        Ext.getCmp("year-max-littlestep").enable(); 
        Ext.getCmp("year-max-largestep").enable(); 

        /*
        var yr_ta = '';
          
        for(y = 0; y <= (yr_end - yr_start); y++) {
          yr_ta += (yr_start + y) + (y <= (yr_end - yr_start)-1 ? ',' : '');
        }
        
        document.getElementById('tabperiod').innerHTML = yr_ta;
        
        var statistic = ($('#avg').attr("checked") ? 'Average' : 'Cumulative') + " Tuna Yearly Catches";
        
        document.getElementById('tabtitle').innerHTML = statistic;
        
        Ext.getCmp('print-button').enable();
        */
        //
        // Showing Map informations panel
        //
        //var infoPanel = Ext.getCmp('info-panel');
        //if(infoPanel.collapsed)
        //    infoPanel.expand();                    
    }
    
});
