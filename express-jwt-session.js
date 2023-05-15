const jwt = require('jsonwebtoken')
const   _ = require('lodash')
const cryptoJs = require('crypto-js')
const lzJs = require('lzjs')

/**
 *
 * @param {string} sessionId cookie key name
 * @param {string} secretToken server side secret token
 * @param {number} tokenExpire by millisecond
 * @param {{ symmetric: boolean }} options symmetric true means information is encrypted
 *
 * @example
 *
 */
module.exports = function (sessionId, secretToken, tokenExpire, options) {
  return function (req, res, next) {
    const symmetric = options ? options.symmetric : false // options?.symmetric
    req.session = {}
    req.__jwtsession_timestamp = null
    res.reWriteSession = function (sessionEntity) {
      if (!sessionEntity || typeof sessionEntity !== 'object') {
        throw new Error('session obj type err')
      }
      if (typeof req.__jwtsession_timestamp !== 'number') {
        req.__jwtsession_timestamp = Date.now()
      }
      var jsonStr = JSON.stringify(_.assign({}, sessionEntity, {
        __timestamp: req.__jwtsession_timestamp
      }))
      if (symmetric) {
        jsonStr = lzJs.compress(cryptoJs.AES.encrypt(jsonStr, secretToken).toString())
      }
      const tokenStr = jwt.sign({ jsonStr }, secretToken, {
        algorithm: 'HS256',
        noTimestamp: true,
      })
      this.cookie(sessionId, tokenStr, {
        maxAge: (3600 * 24 * 365 * 1000) * 2,
        priority: 'high',
        httpOnly: true,
        secure: false,
      })
      return this
    }
    if (!req.cookies[sessionId]) {
      return next()
    }
    jwt.verify(req.cookies[sessionId], secretToken, {
      algorithms: 'HS256',
      ignoreExpiration: true,
    }, function(err, decoded) {
      if (err) {
        res.clearCookie(sessionId)
      } else {
        if (symmetric) {
          var json = (cryptoJs.AES.decrypt(lzJs.decompress(decoded.jsonStr), secretToken)).toString(cryptoJs.enc.Utf8)
        } else {
          json = decoded.jsonStr
        }
        json = JSON.parse(json)
        if (Date.now() - json.__timestamp > tokenExpire) {
          res.clearCookie(sessionId)
        } else {
          req.__jwtsession_timestamp = json.__timestamp
          req.session = _.omit(json, ['__timestamp'])
        }
      }
      next()
    })
  }
}
