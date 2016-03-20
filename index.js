var fs = require('fs');
var path = require('path');

var AWS = require('aws-sdk');
var sharp = require('sharp');

var express = require('express');
var app = express();
var morgan = require('morgan');

app.use(morgan('combined'));

function getImageLocation(image_name, callback) {
  var location = image_name;
  callback(null, location);
}

function getSourceBuffer(image_location, callback) {
  var s3 = new AWS.S3();
  s3.getObject({Bucket: 'com.scottnichol.s3test', Key: image_location}, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data.Body);
    }
  });
}

function getResizedBuffer(source, width, callback) {
  sharp(source)
    .resize(width, null)
    .toBuffer(callback);
}

app.get('/2/image/:image/width/:width', function (req, res) {
  var image_name = req.params['image'];
  var width = parseInt(req.params['width']);
  getImageLocation(image_name, function (err, location) {
    if (err) {
      console.error('Error getting location: ' + err);
      res.status(404);
      res.end();
    } else {
      getSourceBuffer(location, function (err, data) {
        if (err) {
          console.error('Error getting: ' + err);
          res.status(404);
          res.end();
        } else {
          getResizedBuffer(data, width, function (err, buffer, info) {
            if (err) {
              console.error('Error resizing: ' + err);
              res.status(404);
              res.end();
            } else {
              res.header('Content-Type', 'image/jpeg');
              res.header('Cache-Control', 'max-age=86400');
              res.send(buffer);
              res.end();
            }
          });
        }
      });
    }
  });
});

app.listen(8080, function (err) {
  if (err) {
    console.error('Error listening: ' + err);
  } else {
    console.log('Listening on port 8080');
  }
});

