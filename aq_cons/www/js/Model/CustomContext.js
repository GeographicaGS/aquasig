// Copyright 2017 Telefónica Digital España S.L.
// 
// This file is part of UrboCore WWW.
// 
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
// 
// For those usages not covered by this license please contact with
// iot_support at tid dot es

'use strict';

App.Model.Context = Backbone.Model.extend({

  // Defaults data in model
  defaults: {
    start: false,
    finish: false,
    bbox_info: true,
    bbox_status: false,
    bbox: null
  },

  initialize: function (attributes, options) {

    Backbone.Model.prototype.initialize.call(this, [attributes, options]);

    var dataToLocalStorage = JSON.parse(localStorage.getItem('context')) || {};

    // Check if is local (not global) to avoid loading default dates and check if start or finish dates are set
    if (!(attributes && attributes.local || attributes && attributes.start && attributes.finish)) {
      // Set "time" attributes
      dataToLocalStorage.start = dataToLocalStorage.start
        ? moment.utc(dataToLocalStorage.start)
        : moment().subtract(7, 'days').utc();

      dataToLocalStorage.finish = dataToLocalStorage.finish
        ? moment.utc(dataToLocalStorage.finish)
        : moment().utc();
    }

    // Save initial data in model
    this.set(dataToLocalStorage);

    // Check if is local (not global) to avoid saving changes as default dates
    if (!(attributes && attributes.local)) {
      this.on('change', this._save);
    }
  },

  /**
   * Save the context in "localStorage"
   */
  _save: function () {
    localStorage.setItem('context', JSON.stringify(this.toJSON()));
  },

  /**
   * Get dates from "context"
   * 
   * @return {Array | NULL} - bbox data from the map is showed
   */
  getBBOX: function () {
    return this.get('bbox_status') ? this.get('bbox') : null;
  },

  /**
   * Get dates from "context"
   * 
   * @return {Object | FALSE} - data from the date widget
   */
  getDateRange: function () {
    try {
      return {
        start: moment(this.get('start').utc().toDate()).format('YYYY-MM-DD HH:mm:ss'),
        finish: moment(this.get('finish').utc().toDate()).format('YYYY-MM-DD') + ' 23:59:59'
      }
    } catch (err) {
      return false;
    }
  },

});
