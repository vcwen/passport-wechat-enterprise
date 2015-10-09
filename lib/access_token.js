var AccessToken = function(accessToken, expirationTime) {
  if(!(this instanceof AccessToken)) {
    return new AccessToken(accessToken, expirationTime);
  }
  this.accessToken = accessToken;
  this.expirationTime = expirationTime;
}

AccessToken.prototype.isExpired = function() {
  return  this.expirationTime < new Date();
}

AccessToken.prototype.getToken = function() {
  return this.accessToken;
}

module.exports = AccessToken;
