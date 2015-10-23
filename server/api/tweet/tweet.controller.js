'use strict';

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var s3 = new AWS.S3();
var bucket = 'tweetcollections';

// Get list of tweets
exports.index = function(req, res){
    var params = {Bucket : bucket};
    s3.listObjects(params, function(err, data) {
        if (err) {
            return handleError(res, err);
        }
        else {
	    return res.status(200).json(data.Contents);
        }
    });
}

// Creates a new tweet in the DB.
exports.create = function(req, res){
    var params = {Bucket : bucket, 
		  Key : Date.now().toString(), 
		  Body : JSON.stringify(req.body)};
    s3.putObject(params, function(err, data) {
	if (err) {
	    return handleError(res, err);
	}
  	else {
	    return res.status(200).json(data);
	}
    });
};

// Creates a new tweet in the DB.
exports.update = function(req, res){
    var params = {Bucket : bucket,
                  Key : req.params.id,
                  Body : JSON.stringify(req.body)};
    s3.putObject(params, function(err, data) {
        if (err) {
            return handleError(res, err);
        }
        else {
            return res.status(200).json(data);
        }
    });
};

// Get a single tweet
exports.show = function(req, res){
    var params = {Bucket : bucket,
                  Key : req.params.id};
    s3.getObject(params, function(err, data) {
        if (err) {
	    return res.status(err.statusCode).json(err);
        }
        return res.status(200).json(data.Body.toString());
    });
};

// Deletes a tweet from the DB.
exports.destroy = function(req, res){
    var params = {Bucket : bucket,
                  Key : req.params.id};
    s3.getObject(params, function(err, data) {
        if (err) {
	    return res.status(err.statusCode).json(err);
        }
    	s3.deleteObject(params, function(err, data) {
	    if(err) { 
		return handleError(res, err); 
	    }
            return res.status(204).send('No Content');
	});
    });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
