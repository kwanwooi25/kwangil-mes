import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import '../imports/api/users';
import '../imports/api/accounts';
import '../imports/api/products';
import '../imports/api/orders';
import '../imports/api/plates';
import '../imports/api/delivery';
import '../imports/api/slingshot';
import '../imports/api/images';

Meteor.startup(() => {
  if (!Meteor.users.find().count()) {
    const username = 'admin';
    const password = 'admin';
    const profile = {
      displayName: '관리자',
      department: '관리부',
      position: '대빵',
      isManager: false,
      isAdmin: true
    };

    Accounts.createUser({ username, password, profile });
  }
});
