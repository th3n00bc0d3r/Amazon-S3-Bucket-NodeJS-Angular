//Importing Libraries
const express       = require('express')
const expressJWT    = require('express-jwt');
const jwt           = require('jsonwebtoken');
const AWS           = require('aws-sdk');
const multer        = require('multer')

//Initialising Express and Port
const app           = express();
const serverPort    = 8081;
const http          = require('http').Server(app)

//Initialising Multer to Memory Storage
var storage         = multer.memoryStorage()
var upload          = multer({storage: storage});

//JWT Secret Key
var jwt_secret      = 'yoursecretkeyword';

//Intialize Amazon S3
const s3 = new AWS.S3({
    accessKeyId: 'your_access_key',
    secretAccessKey: 'your_secrect',
    region : 'us-east-1',
    signatureVersion: "v4"
});

//Opening Unauthenticated Paths
app.use(expressJWT({ secret: jwt_secret })
    .unless(
        { path: [
           '/',
           /\/public*/
        ]}
    ));

//Root Path
app.get('/', (req, res) => {
    res.json("Welcome to S3 NodeJS Angular Tutorial");
});

//Return JWT Token
app.get('/public/token', (req, res) => {
    var sample_user = {
        "id":       '12345',
        "name":     'soshace_user'
    }          
    
    //Generate Token
    let token = jwt.sign(sample_user, jwt_secret, { expiresIn: '60m'});

    //Send Back Token
    res.json({
        'success': true,
        'token': token
    });
});

//Upload File
app.put('/public/upload', upload.single("image"), function (req, res) {
    var params = {
        Bucket: "soshace-s3-tutorial",
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
    }    

    s3.upload(params).send((err, data) => {
        if (err) {
            res.json({
                'success': false,
                "error": err
            });                    
        }
        res.json({
            'success': true,
            'img_url': data
        });
    }); 

});

//Starting Server Listen
http.listen(serverPort, function() {
    console.log("Listening to " + serverPort);
});
