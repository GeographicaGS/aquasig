'use strict';

App.View.Panels.Aq_cons.Leak = App.View.Panels.Splitted.extend({
  _mapInstance: null,

  _events: {
    'click .details-title > a.back': '_clickClose'
  },

  initialize: function (options) {
    options = _.defaults(options, {
      dateView: true,
      id_category: 'aq_leak',
      spatialFilter: false,
      master: false,
      title: __('Tiempo real'),
      id_panel: 'leak',
      filteView: false,
    });
    _.bindAll(this,'_openDetails');
    _.bindAll(this,'_closeDetails');
    
    this.events = _.extend({},this._events, this.events);
    this.delegateEvents();
    
    App.View.Panels.Splitted.prototype.initialize.call(this, options);

    
    this.render();
  },

  customRender: function() {
    this._widgets = [];

    this._widgets.push(new App.View.Widgets.Aq_cons.FlowSectorRanking({
      id_scope: this.scopeModel.get('id'),
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.PressureSectorRanking({
      id_scope: this.scopeModel.get('id'),
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.FlowEvolution({
      id_scope: this.scopeModel.get('id'),
    }));

    this._widgets.push(new App.View.Widgets.Aq_cons.PressureEvolution({
      id_scope: this.scopeModel.get('id'),
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));
  },
  
  onAttachToDOM: function() {
    this._mapView = new App.View.Panels.Aq_cons.LeakMap({
      el: this.$('.top'),
      scope: this.scopeModel.get('id'),
      type: 'now'
    }).render();

    this.listenTo(this._mapView.mapChanges,'change:clickedSector', this._openDetails);
    this.listenTo(this._mapView.mapChanges,'change:closeDetails', this._closeDetails);
    

    this.subviews.push(this._mapView);
  },

  _onTopHidingToggled: function(e){
    if(this._mapView){
      this._mapView.$el.toggleClass('collapsed');
      setTimeout(function(){
        this._mapView.resetSize();
      }.bind(this), 300);
    }
  },

  _openDetails: function(e) {
    // 1.- Cleaning widget container
    this.$('.bottom .widgetContainer').html('');

    // 2.- Calling to renderer for detail's widget
    // this.customRender();
    this._customRenderDetails(e.get('clickedSector'));
    
    // 3.- Reloading Masonry
    this.$('.bottom .widgetContainer').masonry('reloadItems',{
      gutter: 20,
      columnWidth: 360
    });
  },

  _clickClose: function(){
    this._mapView.mapChanges.set('closeDetails', true);
  },

  _closeDetails: function(e) {
    if (e.get('closeDetails')) {
      // 1.- Cleaning widget container
      this._mapView.mapChanges.set('closeDetails',true);
      this.$('.container > .row > div > .details-title').remove();
      this.$('.bottom .widgetContainer').html('');
  
      // 2.- Calling to renderer for detail's widget
      this.customRender();
      
      // 3.- Reloading Masonry
      this.$('.bottom .widgetContainer').masonry('reloadItems',{
        gutter: 20,
        columnWidth: 360
      });
    }
  },

  _customRenderDetails: function(clickedSector) {
    this._widgets = []; 

    if(this.$('.details-title').length){
      this.$('.details-title').html(
        '<a href="#" class="navElement back"></a>' +    
        clickedSector.features[0].properties.name);
    } else {
      this.$('.container > .row > div').append('<h2 class="details-title">' +
      '<a href="#" class="navElement back"></a>' +
      clickedSector.features[0].properties.name + '</h2>');
    }
    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));

  }

});