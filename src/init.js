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
    
	// http://www.sencha.com/forum/showthread.php?141254-Ext.Slider-not-working-properly-in-IE9
	Ext.override(Ext.dd.DragTracker, {
		onMouseMove: function (e, target) {
		    if (this.active && Ext.isIE && !Ext.isIE9 && !e.browserEvent.button) {
		        e.preventDefault();
		        this.onMouseUp(e);
		        return;
		    }
		    e.preventDefault();
		    var xy = e.getXY(), s = this.startXY;
		    this.lastXY = xy;
		    if (!this.active) {
		        if (Math.abs(s[0] - xy[0]) > this.tolerance || Math.abs(s[1] - xy[1]) > this.tolerance) {
		            this.triggerStart(e);
		        } else {
		            return;
		        }
		    }
		    this.fireEvent('mousemove', this, e);
		    this.onDrag(e);
		    this.fireEvent('drag', this, e);
		}
	});

    var vmeSliderPanel = new VMESliderPanel ({
        xtype: 'panel',
        id: 'id_vmeSliderPanel',
		renderTo: "vme_slider",
        width : 920
    });

});
