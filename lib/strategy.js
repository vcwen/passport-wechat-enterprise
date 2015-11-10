/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
var url = require('url')
var util = require('util')
var utils = require('./utils')
var OAuth2 = require('./oauth');



function WechatEnterpriseStrategy(options, verify, getAccessToken, saveAccessToken) {
  options = options || {};

  if (!verify) {
    throw new TypeError('WechatEnterpriseStrategy requires a verify callback');
  }

  if (!options.corpId) {
    throw new TypeError('WechatEnterpriseStrategy requires a corpId option');
  }
  if (!options.corpSecret) {
   throw new TypeError('WechatEnterpriseStrategy requires a corpSecret option');
  }

  var _getAccessToken = getAccessToken || options.getAccessToken;
  var _saveAccessToken = saveAccessToken || options.saveAccessToken;

  if(!_getAccessToken || !_saveAccessToken) {
    throw new TypeError("WechatEnterpriseStrategy requires 'getAccessToken' and 'saveAccessToken'");
  }

  passport.Strategy.call(this);
  this.name = 'wechat-enterprise';
  this._verify = verify;
  this._oauth2 = new OAuth2(options.corpId,  options.corpSecret, _getAccessToken, _saveAccessToken);
  this._callbackURL = options.callbackURL;
  this._scope = options.scope;
  this._scopeSeparator = options.scopeSeparator || ' ';
  this._state = options.state;
  this._passReqToCallback = options.passReqToCallback
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(WechatEnterpriseStrategy, passport.Strategy);


/**
 * Authenticate request by delegating to a service provider using OAuth 2.0.
 *
 * @param {Object} req
 * @api protected
 */
WechatEnterpriseStrategy.prototype.authenticate = function(req, options) {
  options = options || {};

  var self = this;
  var callbackURL = options.callbackURL || this._callbackURL;
  if (callbackURL) {
    var parsed = url.parse(callbackURL);
    if (!parsed.protocol) {
      // The callback URL is relative, resolve a fully qualified URL from the
      // URL of the originating request.
      callbackURL = url.resolve(utils.originalURL(req, { proxy: this._trustProxy }), callbackURL);
    }
  }

  if (req.query && req.query.code) {
    var code = req.query.code;
    var params = this.tokenParams(options);
    this._oauth2.getAccessToken(params,
      function(err, accessToken) {
        if (err) { return self.error(err);}

        return self.getUserInfo(code, accessToken);
      }
    );
  } else {
    var params = this.authorizationParams(options);
    params.redirect_uri = callbackURL;
    var scope = options.scope || this._scope;
    if (scope) {
      if (Array.isArray(scope)) { scope = scope.join(this._scopeSeparator); }
      params.scope = scope;
    }
    params.state = options.state || this._state;
    var location = this._oauth2.getAuthorizeUrl(params);
    this.redirect(location, 302);
  }
};


WechatEnterpriseStrategy.prototype.getUserInfo = function(code,accessToken) {
  var self = this;
  function verified(err, user, info) {
    if (err) {
      return self.error(err);
    }
    if (!user) {
      return self.fail(info);
    }
    self.success(user, info);
  }

  function verifyResult(accessToken, refreshToken, params,profile,verified) {
    try {
      if (self._passReqToCallback) {
        var arity = self._verify.length;
        if (arity == 6) {
          self._verify(req, accessToken, refreshToken, params, profile, verified);
        } else { // arity == 5
          self._verify(req, accessToken, refreshToken, profile, verified);
        }
      } else {
        var arity = self._verify.length;
        if (arity == 5) {
          self._verify(accessToken, refreshToken, params, profile, verified);
        } else { // arity == 4
          self._verify(accessToken, refreshToken, profile, verified);
        }
      }
    } catch (ex) {
      return self.error(ex);
    }
  }


  this._oauth2.getUserInfo(accessToken, code, function(err, profile){
    if(err) {
      return self.error(err);
    }
    profile.id = profile.UserId;
    if(profile.UserId) {
      verifyResult(null, null,null, profile, verified);
    } else {
      self.fail();
    }

  });
};


WechatEnterpriseStrategy.prototype.authorizationParams = function(options) {
  return {};
};


WechatEnterpriseStrategy.prototype.tokenParams = function(options) {
  return {};
};


module.exports = WechatEnterpriseStrategy;
