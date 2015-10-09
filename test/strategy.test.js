
var chai = require('chai');
chai.use(require('chai-passport-strategy'));
var expect = chai.expect;
var WechatStrategy = require('../lib/strategy');


describe('Strategy', function() {

  var strategy = new WechatStrategy({
      corpId: 'ABC123',
      corpSecret: 'secret'
    },
    function() {},
    function(){},
    function(){});

  it('should be named wechat-enterprise', function() {
    expect(strategy.name).to.equal('wechat-enterprise');
  });
});