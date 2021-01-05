const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');
const glb = fsExtra.readFileSync('bot.glb');
const processGlb = gltfPipeline.processGlb;
const AWS = require('aws-sdk');
const crypto = require('crypto');

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

const uploadFile = async () => {
  // Read content from the file
  // const fileContent = fs.readFileSync(fileName);
  const bot = await processGlb(glb, options);

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

uploadFile();
