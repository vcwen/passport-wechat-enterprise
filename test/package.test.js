var expect = require('chai').expect
var strategy = require('..');

describe('passport-wechat-enterprise', function() {

  it('should export Strategy constructor directly from package', function() {
    expect(strategy).to.be.a('function');
    expect(strategy).to.equal(strategy.Strategy);
  });

  it('should export Strategy constructor', function() {
    expect(strategy.Strategy).to.be.a('function');
  });

})