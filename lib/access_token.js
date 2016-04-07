var AccessToken = function(access_token, expires_in) {
  if (!(this instanceof AccessToken)) {
    return new AccessToken(access_token, expires_in)
  }
  this.access_token = access_token
  this.expires_in = expires_in
  this.create_at = Date.now()
}

AccessToken.prototype.isExpired = function() {
  return (this.create_at + this.expires_in * 1000) < Date.now()
}

module.exports = AccessToken
