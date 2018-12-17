// Copyright 2017 Telefónica Digital España S.L.
//
// PROJECT: urbo-telefonica
//
// This software and / or computer program has been developed by
// Telefónica Digital España S.L. (hereinafter Telefónica Digital) and is protected as
// copyright by the applicable legislation on intellectual property.
//
// It belongs to Telefónica Digital, and / or its licensors, the exclusive rights of
// reproduction, distribution, public communication and transformation, and any economic
// right on it, all without prejudice of the moral rights of the authors mentioned above.
// It is expressly forbidden to decompile, disassemble, reverse engineer, sublicense or
// otherwise transmit by any means, translate or create derivative works of the software and
// / or computer programs, and perform with respect to all or part of such programs, any
// type of exploitation.
//
// Any use of all or part of the software and / or computer program will require the
// express written consent of Telefónica Digital. In all cases, it will be necessary to make
// an express reference to Telefónica Digital ownership in the software and / or computer
// program.
//
// Non-fulfillment of the provisions set forth herein and, in general, any violation of
// the peaceful possession and ownership of these rights will be prosecuted by the means
// provided in both Spanish and international law. Telefónica Digital reserves any civil or
// criminal actions it may exercise to protect its rights.

'use strict';

const PGSQLModel = require('../../models/pgsqlmodel.js');
const utils = require('../../utils.js');
var _ = require('underscore');

const log = utils.log();

class AqMaintenanceModel extends PGSQLModel {
  constructor(cfg) {
    super(cfg);
  }

  get this() {
    return this;  // Because parent is not a strict class
  }

  getOrdersList(opts) {
    let sql = `
      SELECT
        *
      FROM
        ${opts.scope}.aq_maintenance
      WHERE true
        AND id_entity = ${opts.order_number}
        AND created_at between ${opts.finish} and ${opts.start}
        AND type = ${opts.type}
        AND id_user = ${opts.assigned_user}
        AND current_status = ${opts.status}

      `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve(data.rows);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }

  getOrdersList(opts) {
    let sql = `
      SELECT
        *
      FROM
        ${opts.scope}.aq_maintenance
      WHERE true
        AND id_entity = ${opts.order_number}
        AND created_at between ${opts.finish} and ${opts.start}
        AND type = ${opts.type}
        AND id_user = ${opts.assigned_user}
        AND current_status = ${opts.status}

      `;

    return this.promise_query(sql)
    .then(function(data) {

      return Promise.resolve(data.rows);
    })

    .catch(function(err) {
      return Promise.reject(err);
    });
  }


}

module.exports = AqMaintenanceModel;
