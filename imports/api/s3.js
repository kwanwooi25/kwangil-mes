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
    const s3 = new AWS.S3({
      accessKeyId: Meteor.settings.AWSAccessKeyId,
      secretAccessKey: Meteor.settings.AWSSecretAccessKey,
      bucket: 'kwangil-products',
      region: 'ap-northeast-2'
    });

    s3.deleteObject({
      Bucket: 'kwangil-products',
      Key: filename
    }, (err, res) => {
      console.log(err, res);
    });
  }
});
