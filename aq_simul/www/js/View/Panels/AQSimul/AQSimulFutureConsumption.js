'use strict';

App.View.Panels.Aq_simul.Futureconsumption =  App.View.Panels.Base.extend({

  initialize: function(options) {
    options = _.defaults(options, {
      dateView: false,
      id_category: 'aq_simul',
      spatialFilter: false,
      master: false,
      title: __('Consumo futuro'),
      id_panel: 'futureConsumption'
    });
    
    App.View.Panels.Splitted.prototype.initialize.call(this, options);
    
    this.model = {};

    this.getConstructionTypesModel().then((data) => {
      this.FutureScenario = this.getFutureScenarioModel(data);
      this.FutureScenario.parse = function(response) {
        console.log("klsdsgjklsdfg")
      }
      this.render();
    });
    
  },

  customRender: function() {
    this._widgets = [];
    this._scenarios = [];

    this._widgets.push(new App.View.Widgets.Aq_simul.WaterUseTypes(this.constructionTypesData, {
      id_scope: this.scopeModel.get('id'),
      title: __('Tipos de uso de agua'),
      extended: true,
      editable: false,
      dimension: 'allHeight'
    }));
    
    this._widgets.push(new App.View.Widgets.Aq_simul.WaterTotalConsumption(this.FutureScenario, {
      id_scope: this.scopeModel.get('id'),
      dimension: 'double',
    }));

    this.subviews.push(new App.View.Widgets.Container({
      widgets: this._widgets,
      el: this.$('.bottom .widgetContainer')
    }));

    this._mapView = new App.View.Panels.Aq_simul.FutureConsumptionMap({
      el: this.$('.top'),
      scope: this.scopeModel.get('id'),
      type: 'now'
    }).render();
    this.subviews.push(this._mapView);

  },

  getConstructionTypesModel: function () {
    return new Promise((resolve, reject) => {
      this.constructionTypesModel = new App.Model.Aq_simul.ConstructionTypesModel({
        scope : this.scopeModel.get('id')
      });
      this.constructionTypesModel.fetch({data: {filters: {}}});
      this.constructionTypesModel.parse = (data) => {
        _.each(data, function(e) {
          e.rows = _.sortBy(e.rows, 'type_id')
          e.rowsCol1 = e.rows.slice(0, Math.ceil(e.rows.length/2))
          e.rowsCol2 = e.rows.slice(Math.ceil(e.rows.length/2))
        })
        this.constructionTypesData = data;
        resolve(data);
      }
    });
  },

  getFutureScenarioModel: function(data) {
    let paramsData = {
      tipo: 1
    };
    let constructionTypes = ["Vivienda", "Edificio", "Industria", "Uso terciario", "Hospedaje", "Instalación deportiva", "Piscina" ]
    let constructionTypesID = ["cantidadCasas", "cantidadEdificios", "cantidadIndustrial", "cantidadTerciarios", "cantidadHotel", "cantidadDeportivas", "cantidadPiscinas"]

    _.each(data, function(construction) {
      let indexConstruction = constructionTypes.indexOf(construction.type_name);
      let indexConstructionID = constructionTypesID[indexConstruction];
      paramsData[indexConstructionID] = [];
      if (indexConstructionID !== "cantidadPiscinas") {
        _.each(construction.rows, function(row) {
          paramsData[indexConstructionID].push(Number(row.count));
        })
      } else {
        paramsData["cantidadPiscinas"] = Number(construction.count);
      }
    })

    return new App.Collection.Aq_simul.FutureScenario({
      scope : this.scopeModel.get('id'),
      data: paramsData
    });
  },

  _template: _.template($('#AQSimul-panels-future-consumption').html()),
  
  className: 'fill_height flex',

	events: _.extend(
    {
      'click .split_handler': 'toggleTopHiding',
      'click .co_fullscreen_toggle': 'toggleTopFullScreen',
      'click #btCreateScenario': 'createNewScenario',
      'click #btDeleteScenario': 'deleteScenario',
      'updateScenario': 'updateScenario'
    },
    App.View.Panels.Base.prototype.events
  ),

  updateScenario: function(e, model) {
    let newModel = this.getFutureScenarioModel(model.data.constructionTypesModel)
    let siblingChartPosition = model.position + 1;

    this._scenarios.splice(siblingChartPosition, 1);
    $(".scenariosContainer > div")[siblingChartPosition].remove();

    this._scenarios.push(new App.View.Widgets.Aq_simul.WaterTotalConsumption(newModel, {
      id_scope: this.scopeModel.get('id'),
      dimension: 'double',
      position: siblingChartPosition
    }));

    this.subviews.push(new App.View.Widgets.Aq_simul.ScenariosContainer({
      widgets: this._scenarios,
      el: this.$('.bottom .scenariosContainer')
    }));

    $('.bottom .scenariosContainer').masonry('reloadItems',{
      gutter: 20,
      columnWidth: 360
    });

  },

  toggleTopHiding: function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('reverse');
    this.$('.bottom.h50').toggleClass('expanded');

    this._onTopHidingToggled(e);
  },

  // Actions to perform when the top panel hiding mode is toggled
  _onTopHidingToggled: function(e){
    if(this._mapView)
      this._mapView.$el.toggleClass('collapsed');

    if(this._dateView){
      this._dateView.$el.toggleClass('compact');
      this._dateView._compact = $(e.currentTarget).hasClass('reverse') ? true : false;
    }

    if(this._layerTree){
      this._layerTree.$el.removeClass('active').toggleClass('compact');
      this._layerTree.$el.find('h4.active').removeClass('active');
      this._layerTree._compact = $(e.currentTarget).hasClass('reverse') ? true : false;
    }

    if(this._mapSearch){
      this._mapSearch._clearSearch();
        this._mapSearch.toggleView();
    }

    this.$('.co_fullscreen_toggle').toggleClass('hide');
  },

  toggleTopFullScreen: function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('restore');

    this.$('.split_handler').toggleClass('hide');
    this.$('.bottom.h50').toggleClass('collapsed');

    this._onTopFullScreenToggled();
  },

  createNewScenario: function () {
    let constructionTypesData = _.clone(this.constructionTypesData);    
    
    this._scenarios.push(new App.View.Widgets.Aq_simul.WaterUseTypes(constructionTypesData, {
      id_scope: this.scopeModel.get('id'),
      title: __('Tipos de uso de agua'),
      extended: true,
      editable: true,
      dimension: 'allHeight',
      position: this._scenarios.length
    }));

    this._scenarios.push(new App.View.Widgets.Aq_simul.WaterTotalConsumption(this.FutureScenario, {
      id_scope: this.scopeModel.get('id'),
      dimension: 'double',
      position: this._scenarios.length
    }));

    this.subviews.push(new App.View.Widgets.Aq_simul.ScenariosContainer({
      widgets: this._scenarios,
      el: this.$('.bottom .scenariosContainer')
    }));

    $(".panel-future-consumption button.add").addClass('hide')
    $(".panel-future-consumption .scenarios-header").removeClass('hide');
  },


  deleteScenario: function() {
    this._scenarios = [];
    $(".scenariosContainer > div").remove();
    $(".panel-future-consumption button.add").removeClass('hide')
    $(".panel-future-consumption .scenarios-header").addClass('hide');
  },

  // Actions to perform when the top panel full screen mode is toggled
  _onTopFullScreenToggled: function(){
    var _this = this;
    if(this._mapView){
      this._mapView.$el.toggleClass('expanded');
    	setTimeout(function(){
      	_this._mapView.resetSize();
    	}, 300);
    }
  }
});
