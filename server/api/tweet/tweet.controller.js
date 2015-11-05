'use strict';

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var s3 = new AWS.S3({signatureVersion: 'v4'});
var bucket = 'tweetcollections';

var Twitter = require('twitter');
 
var client = new Twitter({
  consumer_key: 'MMTVI11tkg9iovp456V9iYLOz',
  consumer_secret: 'l322IrX6w0hhNEgf6MDf7xeenZb7oLJdWU4g21tNJSCbuAYTdo',
  access_token_key: '164186506-Fq2Qt1RISAPa7Dp8jMjT1BoNTwImFLKuMdpfw58z',
  access_token_secret: 'eLkGavuZIl67GjXlV3KMSo7aiVjgb2aFCXHRKoxaCIhe5'
});

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

// Streaming tweets
exports.stream = function(req, res){
    var hour = req.params.id || 1; //default to 1 hour
    var runningTime = hour * 60 * 60 * 1000;
    
    client.stream('statuses/filter', {track: 'nielsen'}, function(stream) {
  	stream.on('data', function(tweet) {
    	    console.log(tweet.text);
	    
	    var params = {Bucket : bucket,
                  	  Key : Date.now().toString(),
                  	  Body : JSON.stringify(tweet)
			  //SSEKMSKeyId : '527e09d6-694d-4656-b3d9-c7d6633ea007',
			  //ServerSideEncryption : 'aws:kms'
			 };
    	    s3.putObject(params, function(err, data) {
            	if (err) {
		    console.log('Unable to putObject ' + err + err.stack);
            	}
    	    });
  	});
 
  	stream.on('error', function(error) {
    	    throw error;
  	});

	stream.on('end', function() {
	    console.log('Connection ended.');
	});

	//Set the runningTime to 0 if you want to keep it running forever
	if(runningTime > 0) {
	    console.log('Destroy connection after ' + runningTime + '  seconds');
	    setTimeout(function(){
            	stream.destroy();
    	    }, runningTime);
	}
    });	
    return res.status(200);
};

function handleError(res, err) {
  return res.status(500).send(err);
}

//FIXME: Remove this later.
//exports.stream({params:{id:1}}, {status:function(){}});
