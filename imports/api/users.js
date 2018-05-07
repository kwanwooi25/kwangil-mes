import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';

if (Meteor.isServer) {
  Meteor.publish('users', function() {
    return Meteor.users.find();
  });
}

// admin account can update or remove users data
Meteor.users.allow({
  update: function(userId, user) {
    return Meteor.users.findOne(userId).profile.isAdmin;
  },
  remove: function(userId, user) {
    return Meteor.users.findOne(userId).profile.isAdmin;
  }
});

Accounts.validateLoginAttempt(function(data) {
  let diff = new Date() - new Date(data.user.createdAt);

  // prevent auto login on account creation
  if (diff < 2000) {
    return false;
  } else {
    return true;
  }
});

Accounts.config({
    loginExpirationInDays: (1 / 24) * 12 // 12hours
});

Meteor.methods({
  'users.setPassword'(userID, password) {
    Accounts.setPassword(userID, password, { logout: false });
  }
});
