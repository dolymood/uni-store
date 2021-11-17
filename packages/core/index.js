'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/uni-store.prod.cjs')
} else {
  module.exports = require('./dist/uni-store.cjs')
}
