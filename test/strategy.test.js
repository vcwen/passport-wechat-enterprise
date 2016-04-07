/*global describe it before */
const chai = require('chai')
chai.use(require('chai-passport-strategy'))
const expect = chai.expect
const proxyquire = require('proxyquire')
const utilsStub = {
  originalURL: function() {
    return 'http://localhost'
  }
}
const WechatStrategy = proxyquire('../lib/strategy', {
  './utils': utilsStub
})
const AccessToken = require('../lib/access_token')


describe('Strategy', function() {

  describe('constructor', function() {

    const strategy = generateDefaultStrategy()
    it('should be named wechat-enterprise', function() {
      expect(strategy.name).to.equal('wechat-enterprise')
    })
  })


  describe('constructed with undefined options', function() {
    const options = {
      corpId: 'corpid',
      corpSecret: 'corpsecret',
      getAccessToken: getAccessToken,
      saveAccessToken: saveAccessToken
    }
    var opts

    it('should throw an error when verify function is undefined', function() {
      expect(() => {
        new WechatStrategy(options)
      }).to.throw('WechatEnterpriseStrategy requires a verify callback')
    })

    it('should throw an error when corpId  is undefined', function() {
      opts = Object.assign({}, options)
      opts.corpId = undefined
      expect(() => {
        new WechatStrategy(opts, () => {})
      }).to.throw('WechatEnterpriseStrategy requires a corpId option')
    })

    it('should throw an error when corpSecret is undefined', function() {
      opts = Object.assign({}, options)
      opts.corpSecret = undefined
      expect(() => {
        new WechatStrategy(opts, () => {})
      }).to.throw('WechatEnterpriseStrategy requires a corpSecret option')
    })

    it('should throw an error when corpSecret is undefined', function() {
      opts = Object.assign({}, options)
      opts.corpSecret = undefined
      expect(() => {
        new WechatStrategy(opts, () => {})
      }).to.throw('WechatEnterpriseStrategy requires a corpSecret option')
    })

    it('should throw an error when getAccessToken function is undefined', function() {
      opts = Object.assign({}, options)
      opts.getAccessToken = undefined
      expect(() => {
        new WechatStrategy(opts, () => {})
      }).to.throw('WechatEnterpriseStrategy requires \'getAccessToken\' and \'saveAccessToken\'')
    })

    it('should throw an error when saveAccessToken function is undefined', function() {
      opts = Object.assign({}, options)
      opts.saveAccessToken = undefined
      expect(() => {
        new WechatStrategy(opts, () => {})
      }).to.throw('WechatEnterpriseStrategy requires \'getAccessToken\' and \'saveAccessToken\'')
    })
  })

  describe('authorization request with authorization parameters', function() {
    const strategy = generateDefaultStrategy()

    var url

    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u
          done()
        })
        .authenticate()
    })

    it('should be redirected', function() {
      expect(url).to.equal('https://open.weixin.qq.com/connect/oauth2/authorize?appid=ABC123&redirect_uri=http%3A%2F%2Flocalhost%2Fauth%2Fwechat%2Fcallback&response_type=code&scope=snsapi_base&state=state#wechat_redirect')
    })
  })


  describe('error caused by invalid code sent to token endpoint', function() {
    const strategy = generateDefaultStrategy()

    // inject a "mock" oauth2 instance
    strategy._oauth.getAccessToken = function(callback) {
      return callback({
        'errcode': 40029,
        'errmsg': 'invalid code'
      })
    }

    var err

    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e
          done()
        })
        .req(function(req) {
          req.query = {}
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA+ALT1'
        })
        .authenticate()
    })

    it('should error', function() {
      expect(err.errcode).to.equal(40029)
      expect(err.errmsg).to.equal('invalid code')
    })
  })

  describe('fetch user info', () => {
    const options = {
      corpId: 'ABC123',
      corpSecret: 'secret'
    }
    const getUserInfo = (accessToken, code, callback) => {
      var userInfo = null
      var error = null
      switch (code) {
        case 'subscribed':
          {
            userInfo = {
              'UserId': 'USERID',
              'DeviceId': 'DEVICEID'
            }
            break
          }
        case 'unsubscribed':
          {
            userInfo = {
              'UserId': 'OPENID',
              'DeviceId': 'DEVICEID'
            }
            break
          }
        case 'no_user':
          {
            userInfo = {}
            break
          }
        default:
          {
            error = {
              'errcode': 40029,
              'errmsg': 'invalid code'
            }
          }
      }
      callback(error, userInfo)
    }

    it('should fetch info including userId if user has subscribed', function(done) {
      const strategy = new WechatStrategy(options, (profile, verified) => {
        expect(profile.id).to.equal('USERID')
        done()
      }, getAccessToken, () => {})
      strategy._oauth.getUserInfo = getUserInfo

      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {}
          req.query.code = 'subscribed'
        })
        .authenticate()
    })

    it('should fetch info including openId if user has not subscribed', function(done) {
      const strategy = new WechatStrategy(options, (profile, verified) => {
        expect(profile.UserId).to.equal('OPENID')
        done()
      }, getAccessToken, () => {})
      strategy._oauth.getUserInfo = getUserInfo

      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {}
          req.query.code = 'unsubscribed'
        })
        .authenticate()
    })

    it('should return error the code is invalid', function(done) {
      var err
      const strategy = new WechatStrategy(options, (profile, verified) => {
        expect(err.errcode).to.equal(40029)
        expect(err.errmsg).to.equal('invalid code')
        done()
      }, getAccessToken, () => {})
      strategy._oauth.getUserInfo = getUserInfo

      chai.passport.use(strategy)
        .error(function(e) {
          err = e
          done()
        })
        .req(function(req) {
          req.query = {}
          req.query.code = 'invalid_code'
        })
        .authenticate()
    })

    it('should fail if UserId is null', function(done) {
      const strategy = new WechatStrategy(options, (profile, verified) => {}, getAccessToken, () => {})
      strategy._oauth.getUserInfo = getUserInfo

      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {}
          req.query.code = 'no_user'
        })
        .fail(function() {
          done()
        })
        .authenticate()
    })

  })

  describe('verify function ', () => {
    const getUserInfo = (accessToken, code, callback) => {
      const userInfo = {
        'UserId': 'OPENID',
        'DeviceId': 'DEVICEID'
      }
      callback(null, userInfo)
    }

    const options = {
      corpId: 'ABC123',
      corpSecret: 'secret',
      passReqToCallback: false
    }

    it('should pass 3 arguments when passReqToCallback is true', (done) => {
      options.passReqToCallback = true
      const strategy = new WechatStrategy(options, function(req, profile, verified) {
        expect(arguments.length).to.equal(3)
        done()
      }, getAccessToken, saveAccessToken)
      strategy._oauth.getUserInfo = getUserInfo
      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {}
          req.query.code = 'code'
        })
        .authenticate()
    })

    it('should pass 2 arguments when when passReqToCallback is false', (done) => {
      options.passReqToCallback = false
      const strategy = new WechatStrategy(options, function(req, profile, verified) {
        expect(arguments.length).to.equal(2)
        done()
      }, getAccessToken, saveAccessToken)
      strategy._oauth.getUserInfo = getUserInfo
      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {}
          req.query.code = 'code'
        })
        .authenticate()
    })
    it('should get an error when verify function throw any error', (done) => {
      options.passReqToCallback = false
      const strategy = new WechatStrategy(options, function(req, profile, verified) {
        throw new Error('Verify Error')
      }, getAccessToken, saveAccessToken)
      strategy._oauth.getUserInfo = getUserInfo
      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {}
          req.query.code = 'code'
        })
        .error((err) => {
          expect(err).to.be.an('error')
          done()
        })
        .authenticate()
    })
  })

  describe('verified function ', () => {
    const getUserInfo = (accessToken, code, callback) => {
      const userInfo = {
        'UserId': 'OPENID',
        'DeviceId': 'DEVICEID'
      }
      callback(null, userInfo)
    }

    const options = {
      corpId: 'ABC123',
      corpSecret: 'secret',
      passReqToCallback: false
    }

    it('should get an error when get an error', (done) => {
      const strategy = new WechatStrategy(options, function(profile, verified) {
        verified(new Error('error'))
      }, getAccessToken, saveAccessToken)
      strategy._oauth.getUserInfo = getUserInfo
      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {}
          req.query.code = 'code'
        })
        .error((err) => {
          expect(err).to.be.an('error')
          done()
        })
        .authenticate()
    })

    it('should fail the auth when no user is found', (done) => {
      const strategy = new WechatStrategy(options, function(profile, verified) {
        verified(null, null, 'no user is found.')
      }, getAccessToken, saveAccessToken)
      strategy._oauth.getUserInfo = getUserInfo
      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {}
          req.query.code = 'code'
        })
        .fail((info) => {
          expect(info).to.equal('no user is found.')
          done()
        })
        .authenticate()
    })

    it('should be successful when user is set', (done) => {
      const strategy = new WechatStrategy(options, function(profile, verified) {
        verified(null, profile)
      }, getAccessToken, saveAccessToken)
      strategy._oauth.getUserInfo = getUserInfo
      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {}
          req.query.code = 'code'
        })
        .success((profile) => {
          expect(profile).to.be.an('object');
          done()
        })
        .authenticate()
    })

  })

  function generateDefaultStrategy() {
    const options = {
      corpId: 'ABC123',
      corpSecret: 'secret',
      callbackURL: '/auth/wechat/callback',
      scope: 'snsapi_base'
    }
    const strategy = new WechatStrategy(options,
      () => {},
      getAccessToken,
      saveAccessToken)
    return strategy
  }

  function getAccessToken(cb) {
    const token = new AccessToken('token123', 7200)
    cb(null, token)
  }

  function saveAccessToken(accessToken) {

  }
})
