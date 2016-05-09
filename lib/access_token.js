var AccessToken = function(access_token, expires_in, create_at) {
  if (!(this instanceof AccessToken)) {
    return new AccessToken(access_token, expires_in, create_at)
  }
  if (!access_token || !expires_in || !create_at) {
    throw new Error('\'access_token\',  \'expires_in\' and \'create_at\' properties are required.')
  }
  this.access_token = access_token
  this.expires_in = expires_in
  this.create_at = create_at
}

AccessToken.prototype.isExpired = function() {
  return (this.create_at + this.expires_in * 1000) < Date.now()
}

module.exports = AccessToken
