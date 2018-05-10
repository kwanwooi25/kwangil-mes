import { Meteor } from 'meteor/meteor';
import AWS from 'aws-sdk';
import s3PublicURL from 'node-s3-public-url';

export const uploadToS3 = (file, uploader) => {
  return new Promise((resolve, reject) => {
    uploader.send(file, (error, downloadURL) => {
      if (error) {
        reject(console.error(error))
        // reject(console.error('Error uploading', uploader.xhr.response));
      } else {
        const convertedURL = downloadURL.replace(
          file.name,
          `${s3PublicURL(file.name)}`
        );
        resolve(convertedURL);
      }
    });
  });
};

Meteor.methods({
  'deleteFromS3'(filename) {
    AWS.config.update({
      accessKeyId: Meteor.settings.AWSAccessKeyId,
      secretAccessKey: Meteor.settings.AWSSecretAccessKey,
      bucket: Meteor.settings.AWSBucket,
      region: Meteor.settings.AWSRegion
    });

    const s3 = new AWS.S3();

    s3.deleteObject({
      Bucket: 'kwangil-products',
      Key: filename
    }, (err, res) => {
      if (err) console.log(err, err.stack);
      if (res) console.log(res);
    });
  }
});
