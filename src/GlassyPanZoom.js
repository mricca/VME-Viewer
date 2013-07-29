/*draw: function(px) {
        // initialize our internal div
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        px = this.position;

        // place the controls
        this.buttons = [];

        var sz = new OpenLayers.Size(18,18);
        var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);

        this._addButton("panup", "north-mini.png", centered, sz);
        px.y = centered.y+sz.h;
        this._addButton("panleft", "west-mini.png", px, sz);
        this._addButton("panright", "east-mini.png", px.add(sz.w, 0), sz);
        this._addButton("pandown", "south-mini.png", 
                        centered.add(0, sz.h*2), sz);
        this._addButton("zoomin", "zoom-plus-mini.png", 
                        centered.add(0, sz.h*3+5), sz);
        this._addButton("zoomworld", "zoom-world-mini.png", 
                        centered.add(0, sz.h*4+5), sz);
        this._addButton("zoomout", "zoom-minus-mini.png", 
                        centered.add(0, sz.h*5+5), sz);
        return this.div;
    }, */
function GlassyPanZoom(options) {

    this.control = new OpenLayers.Control.PanZoom(options);

    OpenLayers.Util.extend(this.control,{
        /**
     * Method: draw
         *
         * Parameters:
         * px - {<OpenLayers.Pixel>} 
         * 
         * Returns:
         * {DOMElement} A reference to the container div for the PanZoom control.
         */
        imageBase: 'theme/img/nav/',
       draw: function(px) {
            // initialize our internal div
            OpenLayers.Control.prototype.draw.apply(this, arguments);
            px = this.position;

            // place the controls
            this.buttons = [];

            var sz = new OpenLayers.Size(27,27);
            var centered = new OpenLayers.Pixel(px.x+sz.w/2 +10, px.y);

            this._addButton("panup", "north-mini.png", centered, sz);
            px.y = centered.y+sz.h -4 ;
            this._addButton("panleft", "west-mini.png", px, sz);
            this._addButton("panright", "east-mini.png", px.add(sz.w +20, 0), sz);
            this._addButton("pandown", "south-mini.png", 
                            centered.add(0, sz.h*2-8 ), sz);
            sz = new OpenLayers.Size(23,23);
            this._addButton("zoomin", "zoom-plus-mini.png", 
                            px.add(0, sz.h*3-8), sz);
            this._addButton("zoomworld", "zoom-world-mini.png", 
                            px.add((sz.w+2)*1 , sz.h*3-8), sz);
            this._addButton("zoomout", "zoom-minus-mini.png", 
                            px.add((sz.w+2)*2 , sz.h*3-8), sz);
            return this.div;
        },
         /**
         * Method: _addButton
         * 
         * Parameters:
         * id - {String} 
         * img - {String} 
         * xy - {<OpenLayers.Pixel>} 
         * sz - {<OpenLayers.Size>} 
         * 
         * Returns:
         * {DOMElement} A Div (an alphaImageDiv, to be precise) that contains the
         *     image of the button, and has all the proper event handlers set.
         */
        _addButton:function(id, img, xy, sz) {
            var imgLocation = this.imageBase + img;
            var btn = OpenLayers.Util.createAlphaImageDiv(
                                        this.id + "_" + id, 
                                        xy, sz, imgLocation, "absolute");
            btn.style.cursor = "pointer";
            //we want to add the outer div
            this.div.appendChild(btn);

            OpenLayers.Event.observe(btn, "mousedown", 
                OpenLayers.Function.bindAsEventListener(this.buttonDown, btn));
            OpenLayers.Event.observe(btn, "dblclick", 
                OpenLayers.Function.bindAsEventListener(this.doubleClick, btn));
            OpenLayers.Event.observe(btn, "click", 
                OpenLayers.Function.bindAsEventListener(this.doubleClick, btn));
            btn.action = id;
            btn.map = this.map;
        
            if(!this.slideRatio){
                var slideFactorPixels = this.slideFactor;
                var getSlideFactor = function() {
                    return slideFactorPixels;
                };
            } else {
                var slideRatio = this.slideRatio;
                var getSlideFactor = function(dim) {
                    return this.map.getSize()[dim] * slideRatio;
                };
            }

            btn.getSlideFactor = getSlideFactor;

            //we want to remember/reference the outer div
            this.buttons.push(btn);
            return btn;
        }
    
    });
    return this.control;
}
