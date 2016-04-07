const querystring = require('querystring')
const request = require('request')
const AccessToken = require('./access_token.js')

const AuthorizeUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize'
const AccessTokenUrl = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken'
const UserInfoUrl = 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo'


const OAuth = function(corpId, corpSecret, getAccessToken, saveAccessToken) {
  if (!corpId || !corpSecret) {
    throw new Error('Wechat Enterprise OAuth requires \'corpId\' and \'corpSecret\'')
  }
  if (!getAccessToken || !saveAccessToken) {
    throw new Error('Wechat Enterprise OAuth requires \'getAccessToken\' and \'saveAccessToken\'')
  }

  if (!(this instanceof OAuth)) {
    return new OAuth(corpId, corpSecret, getAccessToken, saveAccessToken)
  }
  this._corpId = corpId
  this._corpSecret = corpSecret
  this._getAccessToken = getAccessToken
  this._saveAccessToken = saveAccessToken
}


OAuth.prototype.getAuthorizeUrl = function(options) {
  const params = {}
  params['appid'] = this._corpId
  params['redirect_uri'] = options.redirect_uri
  params['response_type'] = 'code'
  params['scope'] = options.scope || 'snsapi_base'
  params['state'] = options.state || 'state'
  return AuthorizeUrl + '?' + querystring.stringify(params) + '#wechat_redirect'
}

OAuth.prototype.getOAuthAccessToken = function(callback) {
  const params = {}
  params['corpid'] = this._corpId
  params['corpsecret'] = this._corpSecret
  const url = AccessTokenUrl + '?' + querystring.stringify(params)
  const self = this
  wechatRequest(url, function(err, result) {
    if (err) {
      return callback(err)
    }
    const accessToken = new AccessToken(result.access_token, result.expires_in)
    self._saveAccessToken(accessToken)
    callback(null, accessToken)
  })
}


OAuth.prototype.getAccessToken = function(callback) {
  const self = this
  this._getAccessToken(function(err, accessToken) {
    if (err || !accessToken || accessToken.isExpired()) {
      self.getOAuthAccessToken(callback)
    } else {
      callback(null, accessToken)
    }
  })

}

OAuth.prototype.getUserInfo = function(accessToken, code, callback) {
  const params = {}
  params['access_token'] = accessToken.access_token
  params['code'] = code
  const url = UserInfoUrl + '?' + querystring.stringify(params)
  wechatRequest(url, callback)
}

function wechatRequest(url, callback) {
  request(url, function(err, res, body) {
    if (err) return callback(err)
    var result = null
    try {
      result = JSON.parse(body)
    } catch (e) {
      return callback(e)
    }
    if (result.errcode) return callback(result)
    callback(null, result)
  })
}

module.exports = OAuth
