[![npm version](https://badge.fury.io/js/passport-wechat-enterprise.svg)](https://badge.fury.io/js/passport-wechat-enterprise)
[![Dependency Status](https://david-dm.org/wenwei1202/passport-wechat-enterprise.svg)](https://david-dm.org/wenwei1202/passport-wechat-enterprise)
[![Build Status](https://travis-ci.org/wenwei1202/passport-wechat-enterprise.svg?branch=master)](https://travis-ci.org/wenwei1202/passport-wechat-enterprise)
[![Coverage Status](https://coveralls.io/repos/github/wenwei1202/passport-wechat-enterprise/badge.svg?branch=master)](https://coveralls.io/github/wenwei1202/passport-wechat-enterprise?branch=master)
[![Build Status](https://travis-ci.org/wenwei1202/passport-wechat-enterprise.svg?branch=master)](https://travis-ci.org/wenwei1202/passport-wechat-enterprise)
# passport-wechat-enterprise
[Passport](http://passportjs.org/) strategy for authenticating with [Wechat Enterprise Accounts](https://qy.weixin.qq.com/)
using the OAuth 2.0 API.

Passport的微信企业号OAuth2.0用户验证模块， 支持Express，Strongloop|Loopback.

[微信企业号开发文档](http://qydev.weixin.qq.com/wiki/index.php)

微信公众号，转至 [passport-wechat-public](https://github.com/wenwei1202/passport-wechat-public)

## Install

    $ npm install passport-wechat-enterprise

## Usage

#### Configure Strategy

- 在Passport注册WechatEnterpriseStrategy, Passport.use()的第一个参数是name，可以忽略使用默认的名字’wechat-enterprise'。WechatEnterpriseStrategy的构造函数的参数是options,verify 以及getAccessToken和saveAccessToken。

  options的corpId，corpSecret和callbackURL是必需的，其他为可选。verify函数是验证或创建用户传给done函数, getAccessToken和saveAccessToken用已获得AccessToken和保存新的AccessToken，当`getAccessToken`返回的AccessToken无效时，会通过调用微信的`/gettoken`接口获取新的AccessToken，并用`saveAccessToken`进行保存。`getAccessToken` and `saveAccessToken` 都是必需的。


```
passport.use("wechat",new WechatPublicStrategy({
    corpId: CORP_ID,
    corpSecret: CORP_SECRET,
    callbackURL: "http://localhost:3000/auth/wechat/callback",
    state: "state",
    scope: "snsapi_base"
  },
  function(profile, done) {
    User.findOrCreate({ userId: profile.UserId }, function (err, user) {
      return done(err, user);
    });
  },
  function getAccessToken(cb) { ... },
  function saveAccessToken(accessToken,cb){ ... }
));
```

#### Authenticate Requests


用`passport.authenticate()`在对应的route下，注意strategy名字和passport.use()时一致。

For example

```
app.get('/auth/wechat',
  passport.authenticate('wechat'));

app.get('/auth/wechat/callback',
  passport.authenticate('wechat', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```


#### Loopback-Component-Passport

  [Loopback-Component-Passport 官方文档](https://github.com/strongloop/loopback-component-passport).

在`providers.json`加入wechat provider即可，profile的id就是UserId

```
{
  "wechat": {
    "provider": "wechat",
    "module": "passport-wechat-enterprise",
    "callbackURL": "/auth/wechat/callback",
    "successRedirect": "/auth/wechat/account",
    "failureRedirect": "/auth/wechat/failure",
    "scope": "snsapi_base",
    "corpId": "wxabe757c89bb6d74b",
    "corpSecret": "9a62bc24a31d5c7c2b1d053515d276f8",
    "authScheme": "OAuth 2.0"/*required*/
  }
}
```

- 在loopback-component-passport中，strategy的初始化之会传入options和verify，所以这里需要把`getAccessToken ` 和 `saveAccessToken ` 放到options里。

```
function getAccessToken(cb) {...};
function saveAccessToken(accessToken, cb){...};
for (var s in config) {
    var c = config[s];
    c.session = c.session !== false;
    if(s === 'wechat') {
    	c.getAccessToken = getAccessToken;
    	c.saveAccessToken = saveAccessToken;
    }
    passportConfigurator.configureProvider(s, c);
  }
```
## Additional
- 微信的企业用户验证只获得了用户基本信息，实际只获得了id，需要详细的用户信息仍需要调用微信的Users API.

已关注:

```
{
   "UserId":"USERID",
   "DeviceId":"DEVICEID"
}
```

未关注:

```
{
   "OpenId":"OPENID",
   "DeviceId":"DEVICEID"
}

```







