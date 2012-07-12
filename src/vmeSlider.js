Ext.onReady(function(){

    new Ext.Slider({
        renderTo: 'custom-slider',
        width: 670,
        increment: 10,
        minValue: 0,
        maxValue: 100,
        plugins: new Ext.slider.Tip()
    });

    new Ext.Button({
        tooltip: "First year",
        renderTo: 'first-year',
        tooltipType: 'title',
        id: "first-year",
        iconCls: "first-year",
        handler: function(){

        }
    });
    
    new Ext.Button({
        tooltip: "Large interval decrement",
        renderTo: 'year-min-largestep',
        tooltipType: 'title',
        id: "year-min-largestep",
        iconCls: "year-min-largestep",
        handler: function(){

        }
    });

    new Ext.Button({
        tooltip: "Small interval decrement",
        renderTo: 'year-min-littlestep',
        tooltipType: 'title',
        id: "year-min-littlestep",
        iconCls: "year-min-littlestep",
        handler: function(){

        }
    });
    
    new Ext.Button({
        tooltip: "Small interval increment",
        renderTo: 'year-max-littlestep',
        tooltipType: 'title',
        id: "year-max-littlestep",
        iconCls: "year-max-littlestep",
        handler: function(){

        }
    });
    
    new Ext.Button({
        tooltip: "Large interval increment",
        renderTo: 'year-max-largestep',
        tooltipType: 'title',
        id: "year-max-largestep",
        iconCls: "year-max-largestep",
        handler: function(){

        }
    });
    
    new Ext.Button({
        tooltip: "Last year",
        renderTo: 'last-year',
        tooltipType: 'title',
        id: "last-year",
        iconCls: "last-year",
        handler: function(){

        }
    });
    
});
