import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot';

Slingshot.fileRestrictions('upload-product-image', {
  allowedFileTypes: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg',
    'image/gif',
    'image/svg+xml'
  ],
  maxSize: 1 * 1024 * 1024 // 1MB limit (use null for unlimited)
});

Slingshot.createDirective('upload-product-image', Slingshot.S3Storage, {
  bucket: 'kwangil-products',
  acl: 'public-read',
  region: 'ap-northeast-2',
  authorize() {
    if (!this.userId)
      throw new Meteor.Error(
        'need-login',
        'You need to be logged in to upload files!'
      );
    return true;
  },
  key(file) {
    return `${file.name}`;
  }
});
