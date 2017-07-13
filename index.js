var express = require('express');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var fs = require('fs');

var app = express();

var port = process.env.PORT || 3333; // PORT

// Amazon config
var bucket = 'storage-test';
AWS.config.update({
    accessKeyId: 'XXXX',
    secretAccessKey: 'XXXX'
});

// Configure app to use bodyParser()
// Increased limit to receive the blob files
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '50mb'
}));

app.all('/*', function (req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});



// ROUTES
// =============================================================================
var router = express.Router();

// Default welcome message
router.get('/', function (req, res) {
    res.json({
        message: 'Welcome to the api!'
    });
});

router.post('/', function (req, res) {
    var filename = req.body.call + '/' + req.body.role + '.wav';
    var base64data = new Buffer(req.body.blob, 'base64');

    var s3 = new AWS.S3();
    // Upload to S3
    s3.putObject({
        Bucket: bucket,
        Key: filename,
        Body: base64data,
        ACL: 'private'
    }, function (resp) {
        return res.json({
            'status': 'success'
        });
    });
});

app.use('/api', router);

// SERVER START
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);