import { Meteor } from 'meteor/meteor';
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
