# passport-wechat-enterprise
[Passport](http://passportjs.org/) strategy for authenticating with [Wechat Enterprise Accounts](https://qy.weixin.qq.com/)
using the OAuth 2.0 API.

Wechat Development Documents: [Enterprise Accounts](http://qydev.weixin.qq.com/wiki/index.php)

This module lets you authenticate using Wechat in your Node.js applications.
By plugging into Passport, Wechat authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/),[Loopback](http://loopback.io/). It also supports [Loopback-Component-Passport](https://github.com/strongloop/loopback-component-passport).

Wechat Official Accounts version, see [passport-wechat-public](https://github.com/wenwei1202/passport-wechat-public)


## Install

    $ npm install passport-wechat-enterprise

## Usage

#### Configure Strategy

- The Wechat authentication strategy authenticates users using a Wechat
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, `options` specifying an corp ID, corp secret, callback URL, and optionally state, scope. The last two are getAccessToken and saveAccessToken functions for access token, and both required.
  
  `getAccessToken` and `saveAccessToken` are two functions for access token, since wechat has limitation for retrieving access token.For every authentication, it will try to get the access token via `getAccessToken` function,if can't get one it will hit the wechat api `/gettoken` to get a new one then save it via `saveAccessToken` function.

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
Simplely add the a wechat provider into your `providers.json` file. **Notice:profile.id will be same with UserId.**


Please see Strongloop [official documents](https://docs.strongloop.com/pages/releaseview.action?pageId=3836277) for more info about [Loopback-Component-Passport](https://github.com/strongloop/loopback-component-passport).

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

followers:

```
{
   "UserId":"USERID",
   "DeviceId":"DEVICEID"
}
``` 

unfolloers:

```
{
   "OpenId":"OPENID",
   "DeviceId":"DEVICEID"
}

```







