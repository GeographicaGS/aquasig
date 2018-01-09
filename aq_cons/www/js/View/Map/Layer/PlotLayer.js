'use strict';

App.View.Map.Layer.PlotLayer = App.View.Map.Layer.MapboxGLLayer.extend({


  initialize: function(model, body, map) {
    this._idSource = 'plot_datasource';
    this._ids = ['plot_point'];
    
    App.View.Map.Layer.MapboxGLLayer.prototype.initialize.call(this, model, body, map);
  },

  _success: function(change) {
    App.View.Map.Layer.MapboxGLLayer.prototype._success.call(this, change);    
  },

  _layersConfig: function() {
    return this.layers = [{
      'id': this._ids[0],
      'type': 'fill',
      'source': this._idSource,
      'paint': {
        'fill-color': 'black',
      }
    }];
  }
});
