const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');
const fs = require('fs');
const glb = fsExtra.readFileSync('bot.glb');
const processGlb = gltfPipeline.processGlb;
const AWS = require('aws-sdk');
const crypto = require('crypto');
const express = require('express')
const app = express()
const port = 3005
var bodyParser = require('body-parser')
var cors = require('cors')
var multiparty = require('multiparty');
var Busboy = require('busboy');
const fileUpload = require('express-fileupload');
app.use(cors())

app.use(fileUpload());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

const options = {
  dracoOptions: {
    compressionLevel: 10,
  },
};

// processGlb(glb, options).then(function (results) {
//   console.log(results.glb);
//   fsExtra.writeJsonSync('bot_compressed.glb', results.glb);
// });

// Enter copied or downloaded access ID and secret key here
const ID = 'AKIAIULUWO47DK6YBREA';
const SECRET = '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';

// The name of the bucket that you have created
const BUCKET_NAME = '3dcryptobots';

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

function createUniqueID() {
  const current_date = new Date().valueOf().toString();
  const random = Math.random().toString();
  return crypto
    .createHash('sha1')
    .update(current_date + random)
    .digest('hex');
}

const uploadFile = async (binary) => {
  // Read content from the file
  // const fileContent = fs.readFileSync(fileName);
  const bot = await processGlb(binary, options);

  // Setting up S3 upload parameters
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${createUniqueID()}.glb`, // File name you want to save as in S3
    Body: Buffer.from(bot.glb, 'binary'),
  };

  // Uploading files to the bucket
  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log('data', data);
    console.log(`File uploaded successfully. ${data.Location}`);
  });
};

// uploadFile();

const getBinary = (graphPath, asBuffer = false, cb) => {
  let readStream = fs.createReadStream(graphPath)
  let data = ''

  // set stream encoding to binary so chunks are kept in binary
  readStream.setEncoding('binary')
  readStream.once('error', err => {
    return cb(err)
  })
  readStream.on('data', chunk => (data += chunk))
  readStream.on('end', () => {
    // If you need the binary data as a Buffer
    // create one from data chunks       
    return cb(null, asBuffer ? Buffer.from(data, 'binary') : data)
  })
}

app.post('/api/test', function (req, res) {
  console.log(req.body);
  console.log(req.files.file.data);
  uploadFile(req.files.file.data)
    //   const fileContent  = Buffer.from(req.files.file, 'binary');


//     var busboy = new Busboy({ headers: req.headers });

//    // Listen for event when Busboy finds a file to stream.
//     busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//         console.log("In bus boy", JSON.stringify(file));
//         // We are streaming! Handle chunks
//         file.on('data', function(data) {
//             // Here we can act on the data chunks streamed.
//             // console.log("Chunk mila");
//             // console.log(data)
//             // getBinary(data, false, uploadFile)
//         });

//         // Completed streaming the file.
//         file.on('end', function(x) {
//             console.log("x", x);
//             console.log('Finished with ' + filename);
//         });
//     });
//     busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
//         console.log('Field [' + fieldname + ']: value: ' + inspect(val));
//     });

//     busboy.on('finish', function() {
//         console.log("out of busboy");
//         res.sendStatus(200);
//     });
//     req.pipe(busboy);

  // do stuff with file

//    var busboy = new Busboy({ headers: req.headers });
//     busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//         console.log("file", file)
//         file.on('data', function(data) {
//         console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
//       });
//     //   var saveTo = path.join(os.tmpDir(), path.basename(fieldname));
//     //   file.pipe(fs.createWriteStream(saveTo));
//     });
//     busboy.on('finish', function() {
//     //   res.writeHead(200, { 'Connection': 'close' });
//       res.send("That's all folks!");
//     });

//   var form = new multiparty.Form();
//     form.parse(req, function(err, fields, files) {
//         // fields fields fields
//         // console.log("files", files.bot[0].path)
//         // console.log("files", files.bot[0].headers)
//         uploadFile(files)
//     });
    
//   res.send(req.body)
  
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})