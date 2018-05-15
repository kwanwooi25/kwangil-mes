import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import '../imports/api/users';
import '../imports/api/accounts';
import '../imports/api/products';
import '../imports/api/orders';
import '../imports/api/plates';
import '../imports/api/delivery';
import '../imports/api/dashboard';
import '../imports/api/slingshot';
import '../imports/api/images';
import '../imports/api/s3';

Meteor.startup(() => {

  // create admin account on first running app
  if (!Meteor.users.find().count()) {
    const username = 'admin';
    const password = 'admin';
    const profile = {
      displayName: '관리자',
      department: '',
      position: '',
      isManager: false,
      isAdmin: true
    };

    Accounts.createUser({ username, password, profile });
  }
});
