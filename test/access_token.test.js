/*global describe it*/
const chai = require('chai')
const expect = chai.expect
const AccessToken = require('../lib/access_token')


describe('AccessToken ', () => {
  describe('constructor ', () => {
    it('should return the AccessToken as expected', () => {
      const token = new AccessToken('token123', 7200)
      expect(token).to.have.property('access_token', 'token123')
      expect(token).to.have.property('expires_in', 7200)
      expect(token).to.have.property('create_at')
    })

    it('should return the AccessToken when "new" is missed', () => {
      const token =  AccessToken('token123', 7200)
      expect(token).to.be.instanceof(AccessToken)
    })
  })

  describe('isExpired function ', () => {
    it('should return true if token is expired', () => {
      const token = new AccessToken('token123', 7200)
      token.create_at -= 7201 * 1000
      expect(token.isExpired()).to.be.true
    })

    it('should return false if token is valid', () => {
      const token = new AccessToken('token123', 7200)
      expect(token.isExpired()).to.be.false
    })
  })
})
