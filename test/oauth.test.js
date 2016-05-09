/*global describe it*/
const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire')
const requstStub = function(url, callback) {
  const regex = /.+corpid=(.+)&.+$/
  const match = regex.exec(url)
  if (match && match[1] === 'error') {
    callback(new Error('error'))
  } else if (match && match[1] === 'invalid') {
    callback(null, {}, '{"format": error')
  } else if (match && match[1] === 'wechat_error') {
    const err = {
      errcode: 43003,
      errmsg: 'require https'
    }
    callback(null, {}, JSON.stringify(err))
  } else {
    if (url.startsWith(AccessTokenUrl)) {
      const token = {
        access_token: 'token001',
        expires_in: 7200
      }
      callback(null, {}, JSON.stringify(token))
    } else if (url.startsWith(UserInfoUrl)) {
      const userInfo = {
        'UserId': 'USERID',
        'DeviceId': 'DEVICEID'
      }
      callback(null, {}, JSON.stringify(userInfo))
    }
  }
}
const OAuth = proxyquire('../lib/oauth', {
  'request': requstStub
})

const AccessToken = require('../lib/access_token')

const AccessTokenUrl = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken'
const UserInfoUrl = 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo'

describe('OAuth ', () => {
  describe('Constructor ', () => {
    it('should throw errors when any of  are not set', () => {
      expect(() => {
        new OAuth(null, 'corpSecret', () => {}, () => {})
      }).to.throw(/Wechat Enterprise OAuth requires \'corpId\' and \'corpSecret\'/)
      expect(() => {
        new OAuth('corpId', '', () => {}, () => {})
      }).to.throw(/Wechat Enterprise OAuth requires \'corpId\' and \'corpSecret\'/)
      expect(() => {
        new OAuth('corpId', 'corpSecret', null, () => {})
      }).to.throw(/Wechat Enterprise OAuth requires \'getAccessToken\' and \'saveAccessToken\'/)
      expect(() => {
        new OAuth('corpId', 'corpSecret', () => {}, null)
      }).to.throw(/Wechat Enterprise OAuth requires \'getAccessToken\' and \'saveAccessToken\'/)
    })

    it('should return the OAuth when "new" is missed', () => {
      const oauth = OAuth('corpId', 'corpSecret', () => {}, () => {})
      expect(oauth).to.be.instanceof(OAuth)
    })
  })


  describe('getAuthorizeUrl ', () => {
    const oauth = OAuth('corpId', 'corpSecret', () => {}, () => {})
    it('should the authorize url ', () => {
      const options = {
        redirect_uri: '/auth/wechat/callback',
        scope: 'snsapi_base',
        state: 'st'
      }
      const authUrl = oauth.getAuthorizeUrl(options)
      expect(authUrl).to.equal('https://open.weixin.qq.com/connect/oauth2/authorize?appid=corpId&redirect_uri=%2Fauth%2Fwechat%2Fcallback&response_type=code&scope=snsapi_base&state=st#wechat_redirect')
    })
  })

  describe('getOAuthAccessToken ', () => {
    const oauth = OAuth('corpId', 'corpSecret', () => {}, () => {})
    it('should get the access token ', (done) => {
      oauth.getOAuthAccessToken((err, accessToken) => {
        expect(err).to.be.null
        expect(accessToken).to.have.property('access_token')
        expect(accessToken).to.have.property('expires_in')
        done()
      })
    })
    it('should callback with error if error occurs when requesting ', (done) => {
      oauth._corpId = 'error'
      oauth.getOAuthAccessToken((err) => {
        expect(err).to.be.an('error')
        done()
      })
    })

    it('should callback with error if error occurs when requesting ', (done) => {
      oauth._corpId = 'invalid'
      oauth.getOAuthAccessToken((err) => {
        expect(err).to.be.an('error')
        done()
      })
    })

    it('should callback with error if wechat return an error ', (done) => {
      oauth._corpId = 'wechat_error'
      oauth.getOAuthAccessToken((err) => {
        expect(err).to.deep.equal({
          errcode: 43003,
          errmsg: 'require https'
        })
        done()
      })
    })
  })

  describe('getAccessToken ', () => {
    const getAccessToken = function(cb) {
      cb(null, new AccessToken('token', 7200, Date.now()))
    }
    const oauth = OAuth('corpId', 'corpSecret', getAccessToken, () => {})
    oauth.getOAuthAccessToken = function(cb) {
      cb(null, {
        'access_token': 'new_token',
        'expires_in': 7200
      })
    }
    it('should callback with existing access token if available ', (done) => {
      oauth.getAccessToken((err, accessToken) => {
        expect(accessToken).to.have.property('access_token', 'token')
        done()
      })
    })

    it('should request new access token from wechat endpoint if no access token is availble ', (done) => {
      oauth._getAccessToken = function(cb) {
        cb()
      }
      oauth.getAccessToken((err, accessToken) => {
        expect(accessToken).to.have.property('access_token', 'new_token')
        done()
      })
    })
  })

  describe('getUserInfo ', () => {
    const oauth = OAuth('corpId', 'corpSecret', () => {}, () => {})
    const code = 'code'
    const accessToken = new AccessToken('token', 7200, Date.now())
    it('should the authorize url ', () => {
      oauth.getUserInfo(accessToken, code, (err, profile) => {
        expect(profile).to.deep.equal({
          'UserId': 'USERID',
          'DeviceId': 'DEVICEID'
        })
      })
    })
  })


})
