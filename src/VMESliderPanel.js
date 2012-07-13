/*
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Class: MSMPanel
 * Panel that contains MapStoreManager grid.
 * 
 * Inherits from:
 *  - <Ext.Panel>
 *
 */

VMESliderPanel = Ext.extend(Ext.Panel, {
    /**
     * Property: config
     * {object} object for configuring the component. See <config.js>
     *
     */
    config : null,
    /**
     * Property: baseCls
     * {string} class associated to icon
     * 
     */ 
    baseCls:'x-plain',
    /**
     * Property: layout
     * {string} sets the type of layout
     * 
     */ 
    layout:'fit',
    
    defaults: {frame:false, header: false},
    /**
     * Method: initComponent
     * Initializes the component
     * 
     */
    initComponent : function() {
    
		var slider = this;

        this.items = [
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
                            
                            slider.updateVme();
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

                            slider.updateVme();
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

                            slider.updateVme();
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

                                slider.updateVme();
                                
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

                            slider.updateVme();

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
                              
                            slider.updateVme();

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

                            slider.updateVme();

                        }
                    })
                ]
            }
        ];
        
        VMESliderPanel.superclass.initComponent.call(this, arguments);
        
    },
    
    updateVme : function(){

        Ext.getCmp('years-slider').disable();
        Ext.getCmp("year-min-largestep").disable(); 
        Ext.getCmp("year-min-littlestep").disable(); 
        Ext.getCmp("year-max-littlestep").disable(); 
        Ext.getCmp("year-max-largestep").disable();
        Ext.getCmp("last-year").disable(); 
        Ext.getCmp("first-year").disable(); 
         
        var years = Ext.getCmp('years-slider');	
        var yr_start = years.getValues()[0];

        myMap.getLayersByName('Established VME areas')[0].mergeNewParams({'CQL_FILTER': "year = '" + yr_start + "'"});
                
    }
});
