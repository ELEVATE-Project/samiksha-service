//dependencies
const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');
const mongoose_autopopulate = require('mongoose-autopopulate');
const mongoose_timestamp = require('mongoose-timestamp');
const mongoose_ttl = require('mongoose-ttl');
let ObjectId = mongoose.Types.ObjectId;

var DB = function (config) {
  // Added to remove depreciation warnings from logs.
  // mongoose.set('useCreateIndex', true)
  // mongoose.set('useFindAndModify', false)
  // mongoose.set('useUnifiedTopology', true)

  var db = mongoose.createConnection(config.host + '/' + config.database, config.options);
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    log.debug('Connected to DB');
  });

  var createModel = function (opts) {
    if (typeof opts.schema.__proto__.instanceOfSchema === 'undefined') {
      var schema = mongoose.Schema(opts.schema, opts.options);
    } else {
      var schema = opts.schema;
    }

    // apply Plugins
    schema.plugin(mongoose_timestamp, {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    });
    schema.plugin(mongoose_autopopulate);
    schema.plugin(mongoose_delete, { overrideMethods: true, deletedAt: true });

    // Expire at
    if (opts.options) {
      if (opts.options.expireAfterSeconds || opts.options.expireAfterSeconds === 0) {
        log.debug('Expire Configured for ' + opts.name);
        schema.plugin(mongoose_ttl, {
          ttl: opts.options.expireAfterSeconds * 1000,
        });
      }
    }

    //static
    //if(opts.static)
    //schema.statics[opts.static.methodName] = opts.static.method;

    var model = db.model(opts.name, schema, opts.name);
    return model;
  };

  return {
    database: db,
    createModel: createModel,
    ObjectId: ObjectId,
    models: db.models,
  };
};

module.exports = DB;
