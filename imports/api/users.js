import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';

if (Meteor.isServer) {
  Meteor.publish('users', function() {
    return Meteor.users.find();
  });
}

// prevent auto login on account creation
Accounts.validateLoginAttempt(function(data) {
  let diff = new Date() - new Date(data.user.createdAt);
  if (diff < 2000) {
    return false;
  } else {
    return true;
  }
});
