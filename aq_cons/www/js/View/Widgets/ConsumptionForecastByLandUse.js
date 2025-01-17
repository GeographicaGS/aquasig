'use strict';

App.View.Widgets.Aq_cons.ConsumptionForecastByLandUse = App.View.Widgets.Base.extend({

  initialize: function (options) {
    options = _.defaults(options, {
      title: __('Previsión de consumo por usos de suelo'),
      timeMode: 'now',
      id_category: 'aq_cons',
      permissions: { 'variables': ['aq_cons.sector.forecast'] },
      publishable: true,
      classname: 'App.View.Widgets.Aq_cons.ConsumptionForecastByLandUse'
    });
    App.View.Widgets.Base.prototype.initialize.call(this, options);

    if (!this.hasPermissions()) return;
    let nextWeek = App.Utils.getNextWeek();

    this.collection = new App.Collection.Variables.Historic([], {
      id_scope: this.options.id_scope,
      id_variable: 'aq_cons.sector.forecast',
      agg: 'SUM',
      start: nextWeek[0],
      finish: nextWeek[1],
      filters: {
        condition: {},
        group: "aq_cons.sector.usage"
      }
    });
    this.collection.parse = function (response) {
      const elements = {};
      for (const e of response) {
        elements[e.group] = e.value;
      }
      return [{ step: null, elements: elements }];
    };

    this._chartModel = new App.Model.BaseChartConfigModel({
      stacked: true,
      colors: function (d, index) {
        var type = App.Static.Collection.Aq_cons.LandUses.get(d.realKey);
        if (!type) {
          type = App.Static.Collection.Aq_cons.LandUses.get('null');
        }
        return type.get('color');
      },
      xAxisFunction: function (d) {
        return __('Todos los sectores');
      },
      yAxisLabel: {
        axisLabel: __('Consumo (m³)'),
        axisLabelDistance: -300
      },      
      legendTemplate: this._template_legend,
      legendNameFunc: function (d) {
        var type = App.Static.Collection.Aq_cons.LandUses.get(d);
        if (!type) {
          type = App.Static.Collection.Aq_cons.LandUses.get('null');
        }
        return type.get('name');
      },
      formatYAxis: {
        tickFormat: function (d) {
          var value = App.nbf(d, { decimals: 2, compactK: true });
          return value + ' m³';
        }
      }
    });
    this._chartModel.set({ yAxisDomain: [0, 100] });

    this.subviews.push(new App.View.Widgets.Charts.FillBarStacked({
      'opts': this._chartModel,
      'data': this.collection
    }));

    this.filterables = [this.collection];
  }
});
