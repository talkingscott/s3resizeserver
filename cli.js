'use strict';

var sharp = require('sharp');

function resize(img, width) {
  return img.resize(width, null);
}

function save(img, size, callback) {
  // withoutChromaSubsampling()
  img.jpeg().quality(90)
      .toFile('output-sharp-' + size + '.jpg', function (err) {
        callback(err);
      });
}

function buffer(img, size, callback) {
  // withoutChromaSubsampling()
  img.jpeg().quality(90)
      .toBuffer(function (err, buf, info) {
        callback(err);
      });
}

var done = true;

function resizeAndSave(img, size) {
  console.time('sharp-' + size);
  var jmg = resize(img, size);
  buffer(jmg, size, function (err) {
    if (err) {
      console.error('Error saving: ' + err);
    } else {
      console.timeEnd('sharp-' + size);
    }
    done = true;
  });
}

function callLoop(fn, img, sz, incr, mx) {
  if (done) {
    sz += incr;
    if (sz <= mx) {
      done = false;
      fn(img, sz);
      setImmediate(callLoop, fn, img, sz, incr, mx);
    } else {
      console.info('callLoop done');
    }
  } else {
    setImmediate(callLoop, fn, img, sz, incr, mx);
  }
}

var img = sharp('images/Crouching+Tiger+Hidden+Dragon+The+Green+Legend+still+1.jpg');

setImmediate(callLoop, resizeAndSave, img, 128, 128, 2048);

var gd = require('node-gd');

function gdresize(img, width) {
  var height = Math.floor(img.height * (width / img.width));
  var dest = gd.createTrueColorSync(width, height);
//  img.copyResampled(dest, 0, 0, 0, 0, width, height, img.width, img.height);
  img.copyResized(dest, 0, 0, 0, 0, width, height, img.width, img.height);
  return dest;
}

function gdsave(img, size, callback) {
  img.saveJpeg('output-gd-' + size + '.jpg', 90, function (err) {
    callback(err);
  });
}

function gdbuffer(img, size, callback) {
  var data = img.jpegPtr(90);
  callback(null);
}

function gdresizeAndSave(img, size) {
  console.time('gd-' + size);
  var jmg = gdresize(img, size);
  gdbuffer(jmg, size, function (err) {
    if (err) {
      console.error('Error saving: ' + err);
    } else {
      console.timeEnd('gd-' + size);
    }
    done = true;
  });
}

gd.openFile('images/Crouching+Tiger+Hidden+Dragon+The+Green+Legend+still+1.jpg', function (err, img) {
  if (err) {
    console.error('Error opening: ' + err);
  } else {
    done = true;
    setImmediate(callLoop, gdresizeAndSave, img, 128, 128, 2048);
  }
});
