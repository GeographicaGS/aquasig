'use strict';

App.View.Map.Layer.Aq_simul.GeoJSONLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function(config) {
    this.legendConfig = config.legend;
    this.layers = config.layers;
    this._ignoreOnLegend = config.ignoreOnLegend;
    this._idSource = config.source.id;
    this._ids = config.layers.map(l => l.id);
    this.popupTemplate = new App.View.Map.AQSimulMapboxGLPopup('#AQSimul-popups-rates_popup');

    App.View.Map.Layer.MapboxGLLayer.prototype
      .initialize.call(this, config.source.model,
      config.source.payload,config.legend, config.map);
  },

  _layersConfig: function() {
    return this.layers;
  },

  setInteractivity: function(label, properties = []) {
    this.on('click',this.layers.map(l => l.id)[0], function(e) {
      let mpopup = new mapboxgl.Popup()
      .setLngLat(e.lngLat);
      const featuresHolder = {features: e.features};
      mpopup.setHTML(this.popupTemplate
        .drawTemplate(label,properties, featuresHolder, mpopup)).addTo(this._map._map);
    }.bind(this));
    return this;
  },

  setHoverable: function(isHoverable) {
    if (isHoverable) {
      this.on('mouseenter',_.map(this.layers,function(l) {return l.id}), function(e) {
        this._map._map.getCanvas().style.cursor = 'pointer';
      }.bind(this));

      this.on('mouseleave',_.map(this.layers,function(l) {return l.id}), function() {
        this._map._map.getCanvas().style.cursor = '';
      }.bind(this));
    }
    return this;
  },

  updatePaintOptions: function(options) {
    this.layers[0].paint['fill-color']['property'] = options;
    this._map._map.setPaintProperty(this._ids[0], 'fill-color', this.layers[0].paint['fill-color']);
  },
});
