var querystring= require('querystring');
var request = require('request');
var moment = require('moment');
var AccessToken = require('./access_token.js');

var AuthorizeUrl = "https://open.weixin.qq.com/connect/oauth2/authorize";
var AccessTokenUrl = "https://qyapi.weixin.qq.com/cgi-bin/gettoken";
var UserInfoUrl = "https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo";


var OAuth = function(corpId, corpSecret, getAccessToken, saveAccessToken) {
  if(!getAccessToken || !saveAccessToken) {
    throw new TypeError("Wechat Enterprise OAuth requires 'getAccessToken' and 'saveAccessToken ");
  }
  this._corpId= corpId;
  this._corpSecret= corpSecret;
  this._getAccessToken = getAccessToken;
  this._saveAccessToken = saveAccessToken;
}


OAuth.prototype.getAuthorizeUrl= function( options ) {
  var params =  {};
  params['appid'] = this._corpId;
  params['redirect_uri'] = options.redirect_uri;
  params['response_type'] = 'code';
  params['scope'] = options.scope || "snsapi_base";
  params['state'] = options.state || "state";
  return AuthorizeUrl + "?" + querystring.stringify(params) + "#wechat_redirect";
}

OAuth.prototype.getOAuthAccessToken= function(params, callback) {
  var params= params || {};
  params['corpid'] = this._corpId;
  params['corpsecret'] = this._corpSecret;
  var url = AccessTokenUrl + "?" + querystring.stringify(params);
  request(url, function(err, res, body){
    if(err) return callback(err);
    var result = null;
    try {
      result = JSON.parse(body);
    } catch(e) {
      return callback(e);
    }
    if(result.errcode) return callback(result);
    var accessToken = new AccessToken(result.access_token, moment().add(7100, 'seconds').toDate());
    this._saveAccessToken(accessToken);
    callback(null, accessToken);
  });
}


OAuth.prototype.getAccessToken= function( params, callback) {
  var self = this;
  this._getAccessToken(function(err, accessToken){
    if(err || !accessToken || accessToken.isExpired()) {
      self.getOAuthAccessToken(params, callback);
    } else {
      callback(null, accessToken);
    }
  });

}

OAuth.prototype.getUserInfo = function(accessToken, code, callback) {
  var params= {};
  params['access_token'] = accessToken.getToken();
  params['code'] = code;
  var url = UserInfoUrl + "?" + querystring.stringify(params);
  request(url, function(err, res, body){
    if(err) return callback(err);
    var result = null;
    try {
      result = JSON.parse(body);
    } catch (e) {
      return callback(e);
    }
    if(result.errcode) return callback(result);
    callback(null, result);
  });
}

module.exports = OAuth;




