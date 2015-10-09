# passport-wechat-enterprise
[Passport](http://passportjs.org/) strategy for authenticating with [Wechat Enterprise Accounts](https://qy.weixin.qq.com/)
using the OAuth 2.0 API.

Wechat Development Documents: [Enterprise Accounts](http://qydev.weixin.qq.com/wiki/index.php)

This module lets you authenticate using Wechat in your Node.js applications.
By plugging into Passport, Wechat authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/). It also supports [Loopback-Component-Passport](https://github.com/strongloop/loopback-component-passport).

Wechat Official Accounts version, see [passport-wechat-public](https://github.com/wenwei1202/passport-wechat-public)

Passport的微信企业号OAuth2.0用户验证模块， 支持Express，Strongloop|Loopback 以及loopback-component-passport。

微信公众号，转至 [passport-wechat-public](https://github.com/wenwei1202/passport-wechat-public)

## Install

    $ npm install passport-wechat-enterprise

## Usage

#### Configure Strategy

- The Wechat authentication strategy authenticates users using a Wechat
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, `options` specifying an corp ID, corp secret, callback URL, and optionally state, scope. The last two are getAccessToken and saveAccessToken functions for access token, and both required.
  
  `getAccessToken` and `saveAccessToken` are two functions for access token, since wechat has limitation for retrieving access token.For every authentication, it will try to get the access token via `getAccessToken` function,if can't get one it will hit the wechat api `/gettoken` to get a new one then save it via `saveAccessToken` function.

- 在Passport注册WechatEnterpriseStrategy, Passport.use()的第一个参数是name，可以忽略使用默认的名字’wechat-enterprise'。WechatEnterpriseStrategy的构造函数的参数是options,verify 以及getAccessToken和saveAccessToken。


  options的corpId，corpSecret和callbackURL是必须的，其他为可选。verify函数是验证或创建用户传给done函数, getAccessToken和saveAccessToken用已获得AccessToken和保存新的AccessToken，当`getAccessToken`返回的AccessToken无效时，会通过调用微信的`/gettoken`接口获取新的AccessToken，并用`saveAccessToken`进行保存。`getAccessToken` and `saveAccessToken` 都是必需的。


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

Use `passport.authenticate()`, specifying the strategy with the name `'wechat' or default name 'wechat-enterprise'`, to
authenticate requests.

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
Simple add the a wechat provider into your `providers.json` file. **AuthScheme is required**,tell the framework using OAuth 2.0. **Notice:profile.id will be same with UserId.**


Please see Strongloop [official documents](https://docs.strongloop.com/pages/releaseview.action?pageId=3836277) for more info about [Loopback-Component-Passport](https://github.com/strongloop/loopback-component-passport).

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

- Since in loopback-component-passport, you won't initialize the Strategy by your own, do the trick, put the `getAccessToken ` and `saveAccessToken ` into the options, it's also acceptable.
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
- Wechat enterprise authentication only get simple profile,like below, so if you want to the complete profile, still need to hit the users API for more info.
- 微信的企业用户验证只获得了用户基本信息，实际只获得了id，需要详细的用户信息仍需要调用微信的Users API.

followers/已关注:

```
{
   "UserId":"USERID",
   "DeviceId":"DEVICEID"
}
``` 

unfolloers/未关注:

```
{
   "OpenId":"OPENID",
   "DeviceId":"DEVICEID"
}

```







