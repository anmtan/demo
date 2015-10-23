/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Tweet = require('./tweet.model');

exports.register = function(socket) {
  Tweet.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Tweet.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('tweet:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('tweet:remove', doc);
}