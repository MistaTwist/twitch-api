'use strict';
var oauth = require("oauth");
var request = require("request");

var baseUrl = 'https://api.twitch.tv/kraken';
var authorizePath = '/oauth2/authorize';
var accessTokenPath = '/oauth2/token';

var Twitch = function (options){
  if (!(this instanceof Twitch))
    return new Twitch(options);

  this.clientId = options.clientId;
  this.clientSecret = options.clientSecret;
  this.redirectUri = options.redirectUri;
  this.scope = options.scope;

  this.oa = new oauth.OAuth2(
    this.clientId, this.clientSecret, baseUrl, authorizePath, accessTokenPath
  );

  this.oa.setAccessTokenName('oauth_token');

  return this;
};

Twitch.prototype._createRequest = function(options, parameters){
  return {
    method: options.method,
    url: baseUrl + options.path,
    qs: parameters,
    headers: {
      'Authorization': options.accessToken?'OAuth ' + options.accessToken : undefined,
      'Accept': 'Accept: application/vnd.twitchtv.v3+json'
    },
    body: options.body,
    json: true
  };
};

Twitch.prototype._launchRequest = function(req, callback){
  request(req, function(err, response, body){
    if (!err && body && !body.error){
      callback(null, body);
    } else {
      callback(err || body);
    }
  });
};

Twitch.prototype._executeRequest = function(options, parameters, callback){
  // check for optional parameters
  if(!callback){
    callback = parameters;
    parameters = undefined;
  }

  var req = this._createRequest(options, parameters);

  this._launchRequest(req, callback);
};

Twitch.prototype.getAccessToken = function(code, callback){
  this.oa.getOAuthAccessToken(code,
    {
      grant_type: 'authorization_code',
      scope: ['user_read'],
      redirect_uri: this.redirectUri
    },
    function (err, accessToken, refreshToken, results){
      if (!err){
        callback(null, results);
      } else {
        callback(err);
      }
    }
  );
};

// ######  #       #######  #####  #    #  #####
// #     # #       #     # #     # #   #  #     #
// #     # #       #     # #       #  #   #
// ######  #       #     # #       ###     #####
// #     # #       #     # #       #  #         #
// #     # #       #     # #     # #   #  #     #
// ######  ####### #######  #####  #    #  #####

Twitch.prototype.getBlocks =
function (userName, accessToken, parameters, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/users/' + userName + '/blocks',
      accessToken: accessToken,
    },
    parameters,
    callback
  );
};

Twitch.prototype.addBlock = function(userName, accessToken, target, callback){
  this._executeRequest(
    {
      method: 'PUT',
      path: '/users/' + userName + '/blocks/' + target,
      accessToken: accessToken,
    },
    callback
  );
};

Twitch.prototype.removeBlock =
function(userName, accessToken, target, callback){
  this._executeRequest(
    {
      method: 'DELETE',
      path: '/users/' + userName + '/blocks/' + target,
      accessToken: accessToken,
    },
    callback
  );
};


//  #####  #     #    #    #     # #     # ####### #        #####
// #     # #     #   # #   ##    # ##    # #       #       #     #
// #       #     #  #   #  # #   # # #   # #       #       #
// #       ####### #     # #  #  # #  #  # #####   #        #####
// #       #     # ####### #   # # #   # # #       #             #
// #     # #     # #     # #    ## #    ## #       #       #     #
//  #####  #     # #     # #     # #     # ####### #######  #####

Twitch.prototype.getChannel = function(channel, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/channels/' + channel
    },
    callback
  );
};

Twitch.prototype.getUserChannel = function(accessToken, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/channel',
      accessToken: accessToken
    },
    callback
  );
};

// the user should be the owner (maybe editor?) of the channel
Twitch.prototype.getChannelEditors = function(channel, accessToken, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/channels/' + channel + '/editors',
      accessToken: accessToken
    },
    callback
  );
};

Twitch.prototype.updateChannel =
function (channel, accessToken, channelOptions, callback) {
  this._executeRequest(
    {
      method: 'PUT',
      path: '/channels/' + channel,
      accessToken: accessToken,
      body: channelOptions
    },
    callback
  );
};


Twitch.prototype.resetStreamKey =
  function (channel, accessToken, callback) {
  this._executeRequest(
    {
      method: 'DELETE',
      path: '/channels/' + channel + '/stream_key',
      accessToken: accessToken
    },
    callback
  );
};

Twitch.prototype.startCommercial =
function (channel, accessToken, parameters, callback) {
  this._executeRequest(
    {
      method: 'POST',
      path: '/channels/' + channel + '/commercial',
      accessToken: accessToken
    },
    parameters,
    callback
  );
};

Twitch.prototype.getChannelTeams = function(channel, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/channels/' + channel + '/teams'
    },
    callback
  );
};

//  #####  #     #    #    #######
// #     # #     #   # #      #
// #       #     #  #   #     #
// #       ####### #     #    #
// #       #     # #######    #
// #     # #     # #     #    #
//  #####  #     # #     #    #

Twitch.prototype.getChat = function(channel, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/chat/' + channel,
    },
    callback
  );
};

Twitch.prototype.getEmoticons = function(callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/chat/emoticons',
    },
    callback
  );
};

Twitch.prototype.getChannelBadges = function(channel, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/chat/' + channel + '/badges',
    },
    callback
  );
};

// ####### ####### #       #       ####### #     #  #####
// #       #     # #       #       #     # #  #  # #     #
// #       #     # #       #       #     # #  #  # #
// #####   #     # #       #       #     # #  #  #  #####
// #       #     # #       #       #     # #  #  #       #
// #       #     # #       #       #     # #  #  # #     #
// #       ####### ####### ####### #######  ## ##   #####

Twitch.prototype.getChannelFollows = function(channel, parameters, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/channels/' + channel + '/follows',
    },
    parameters,
    callback
  );
};

Twitch.prototype.getUserFollowedChannels = function(user, parameters, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/users/' + user + '/follows/channels',
    },
    parameters,
    callback
  );
};

Twitch.prototype.getUserFollowsChannel = function(user, channel, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/users/' + user + '/follows/channels/' + channel,
    },
    callback
  );
};

Twitch.prototype.userFollowChannel =
function(user, accessToken, channel, parameters, callback){
  this._executeRequest(
    {
      method: 'PUT',
      path: '/users/' + user + '/follows/channels/' + channel,
      accessToken: accessToken
    },
    parameters,
    callback
  );
};

Twitch.prototype.userUnfollowChannel =
function(user, accessToken, channel, callback){
  this._executeRequest(
    {
      method: 'DELETE',
      path: '/users/' + user + '/follows/channels/' + channel,
      accessToken: accessToken
    },
    callback
  );
};

//  #####     #    #     # #######  #####
// #     #   # #   ##   ## #       #     #
// #        #   #  # # # # #       #
// #  #### #     # #  #  # #####    #####
// #     # ####### #     # #             #
// #     # #     # #     # #       #     #
//  #####  #     # #     # #######  #####

Twitch.prototype.getTopGames = function(parameters, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/games/top'
    },
    parameters,
    callback
  );
};

// ### #     #  #####  #######  #####  #######  #####
//  #  ##    # #     # #       #     #    #    #     #
//  #  # #   # #       #       #          #    #
//  #  #  #  # #  #### #####    #####     #     #####
//  #  #   # # #     # #             #    #          #
//  #  #    ## #     # #       #     #    #    #     #
// ### #     #  #####  #######  #####     #     #####

Twitch.prototype.getIngests = function(callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/ingests'
    },
    callback
  );
};

// ######  ####### ####### #######
// #     # #     # #     #    #
// #     # #     # #     #    #
// ######  #     # #     #    #
// #   #   #     # #     #    #
// #    #  #     # #     #    #
// #     # ####### #######    #

Twitch.prototype.getRoot = function(accessToken, callback){
  // acccessToken is optional
  if (!callback){
   callback = accessToken;
   accessToken = undefined;
  }

  this._executeRequest(
    {
      method: 'GET',
      path: '/',
      accessToken: accessToken
    },
    callback
  );
};

//  #####  #######    #    ######   #####  #     #
// #     # #         # #   #     # #     # #     #
// #       #        #   #  #     # #       #     #
//  #####  #####   #     # ######  #       #######
//       # #       ####### #   #   #       #     #
// #     # #       #     # #    #  #     # #     #
//  #####  ####### #     # #     #  #####  #     #

Twitch.prototype._search = function(entity, parameters, callback){
  this._executeRequest(
    {
      method: 'GET',
      path: '/search/' + entity
    },
    parameters,
    callback
  );
};

Twitch.prototype.searchChannels = function(parameters, callback){
  this._search('channels', parameters, callback);
};

Twitch.prototype.searchStreams = function(parameters, callback){
  this._search('streams', parameters, callback);
};

Twitch.prototype.searchGames = function(parameters, callback){
  this._search('games', parameters, callback);
};

//  #####  ####### ######  #######    #    #     #  #####
// #     #    #    #     # #         # #   ##   ## #     #
// #          #    #     # #        #   #  # # # # #
//  #####     #    ######  #####   #     # #  #  #  #####
//       #    #    #   #   #       ####### #     #       #
// #     #    #    #    #  #       #     # #     # #     #
//  #####     #    #     # ####### #     # #     #  #####

Twitch.prototype.getChannelStream = function (channel, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/streams/' + channel
    },
    callback
  );
};

Twitch.prototype.getStreams = function (parameters, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/streams'
    },
    parameters,
    callback
  );
};

Twitch.prototype.getFeaturedStreams = function (parameters, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/streams/featured'
    },
    parameters,
    callback
  );
};

Twitch.prototype.getStreamsSummary = function (parameters, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/streams/summary'
    },
    parameters,
    callback
  );
};

//  #####  #     # ######   #####
// #     # #     # #     # #     #
// #       #     # #     # #
//  #####  #     # ######   #####
//       # #     # #     #       # ###
// #     # #     # #     # #     # ###
//  #####   #####  ######   #####  ###

Twitch.prototype.getChannelSubscriptions =
function (channel, accessToken, parameters, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/channels/' + channel + '/subscriptions',
      accessToken: accessToken
    },
    parameters,
    callback
  );
};

// do you have to be the channel owner?
Twitch.prototype.getUserSubscriptionToChannel =
function (user, channel, accessToken, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/channels/' + channel + '/subscriptions/' + user,
      accessToken: accessToken
    },
    callback
  );
};

Twitch.prototype.getChannelSubscriptionOfUser =
function (user, channel, accessToken, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/users/' + user + '/subscriptions/' + channel,
      accessToken: accessToken
    },
    callback
  );
};

// ####### #######    #    #     #  #####
//    #    #         # #   ##   ## #     #
//    #    #        #   #  # # # # #
//    #    #####   #     # #  #  #  #####
//    #    #       ####### #     #       #
//    #    #       #     # #     # #     #
//    #    ####### #     # #     #  #####

Twitch.prototype.getTeams = function (parameters, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/teams'
    },
    parameters,
    callback
  );
};

Twitch.prototype.getTeam = function (team, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/teams/' + team
    },
    callback
  );
};

// #     #  #####  ####### ######   #####
// #     # #     # #       #     # #     #
// #     # #       #       #     # #
// #     #  #####  #####   ######   #####
// #     #       # #       #   #         #
// #     # #     # #       #    #  #     #
//  #####   #####  ####### #     #  #####

Twitch.prototype.getUser = function (user, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/users/' + user
    },
    callback
  );
};

Twitch.prototype.getAuthorizedUser = function (accessToken, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/user',
      accessToken: accessToken
    },
    callback
  );
};

Twitch.prototype.getAuthorizedUserFollowedStreams =
function (accessToken, parameters, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/streams/followed',
      accessToken: accessToken
    },
    parameters,
    callback
  );
};

Twitch.prototype.getAuthorizedUserFollowedVideos =
function (accessToken, parameters, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/videos/followed',
      accessToken: accessToken
    },
    parameters,
    callback
  );
};

// #     # ### ######  ####### #######  #####
// #     #  #  #     # #       #     # #     #
// #     #  #  #     # #       #     # #
// #     #  #  #     # #####   #     #  #####
//  #   #   #  #     # #       #     #       #
//   # #    #  #     # #       #     # #     #
//    #    ### ######  ####### #######  #####

Twitch.prototype.getVideo = function (videoId, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/videos/' + videoId
    },
    callback
  );
};

Twitch.prototype.getTopVideos = function (parameters, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/videos/top'
    },
    parameters,
    callback
  );
};

Twitch.prototype.getChannelVideos = function (channel, parameters, callback) {
  this._executeRequest(
    {
      method: 'GET',
      path: '/channels/' + channel + '/videos'
    },
    parameters,
    callback
  );
};

module.exports =  Twitch;
