'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/un-store.prod.cjs')
} else {
  module.exports = require('./dist/un-store.cjs')
}
