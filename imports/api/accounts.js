import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const AccountsData = new Mongo.Collection('accounts');

if (Meteor.isServer) {
  Meteor.publish('accounts', function() {
    return AccountsData.find({}, { sort: { name: 1 } });
  });
}

/*=============================================
 ASSIGNING METHODS
 Naming convention: resource.action
=============================================*/

Meteor.methods({
  'accounts.insert'(data) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin || user.profile.isManager) {
      if (!AccountsData.findOne({ name: data.name })) {
        AccountsData.insert(data);
      } else {
        throw new Meteor.Error('이미 존재하는 업체입니다.');
      }
    }
  },

  'accounts.insertmany'(json) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin || user.profile.isManager) {
      json.map(account => {
        AccountsData.insert(account);
      });
    }
  },

  'accounts.update'(accountID, data) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin || user.profile.isManager) {
      AccountsData.update({ _id: accountID }, { $set: data });
    }
  },

  'accounts.remove'(accountID) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin || user.profile.isManager) {
      AccountsData.remove({ _id: accountID });
    }
  }
});

Accounts.schema = new SimpleSchema({
  name: { type: String },
  phone_1: { type: String },
  phone_2: { type: String, optional: true },
  fax: { type: String, optional: true },
  email_1: { type: String, regEx: SimpleSchema.RegEx.Email, optional: true },
  email_2: { type: String, regEx: SimpleSchema.RegEx.Email, optional: true },
  address: { type: String, optional: true },
  memo: { type: String, optional: true }
});
