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
 * Function: init.js
 * Initializes the component VMESliderPanel
 * 
 */

Ext.onReady(function(){

    Ext.QuickTips.init();
    
    var vmeSliderPanel = new VMESliderPanel ({
        xtype: 'panel',
        id: 'id_vmeSliderPanel',
		renderTo: "vme_slider",
        width : 815
    });

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

});
