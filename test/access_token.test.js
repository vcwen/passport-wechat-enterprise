/*global describe it*/
const chai = require('chai')
const expect = chai.expect
const AccessToken = require('../lib/access_token')


describe('AccessToken ', function() {
  describe('constructor ', function() {
    it('should return the AccessToken as expected', function() {
      const token = new AccessToken('token123', 7200, Date.now())
      expect(token).to.have.property('access_token', 'token123')
      expect(token).to.have.property('expires_in', 7200, Date.now())
      expect(token).to.have.property('create_at')
    })

    it('should return the AccessToken when "new" is missed', function() {
      const token = AccessToken('token123', 7200, Date.now())
      expect(token).to.be.instanceof(AccessToken)
    })

    it('should throw error when any of required arguments is null ', function() {
      const args = [
        ['token', 7200, null],
        ['token', null, Date.now()],
        [null, 7200, Date.now()]
      ]
      args.forEach((arg) => {
        expect(function() {
          AccessToken.apply(null, arg)
        }).to.throw(Error)
      })

    })
  })

  describe('isExpired function ', function() {
    it('should return true if token is expired', function() {
      const token = new AccessToken('token123', 7200, Date.now())
      token.create_at -= 7201 * 1000
      expect(token.isExpired()).to.be.true
    })

    it('should return false if token is valid', function() {
      const token = new AccessToken('token123', 7200, Date.now())
      expect(token.isExpired()).to.be.false
    })
  })
})
