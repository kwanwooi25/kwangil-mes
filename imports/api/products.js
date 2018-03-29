import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const ProductsData = new Mongo.Collection('products');

if (Meteor.isServer) {
  Meteor.publish('products', function() {
    return ProductsData.find();
  });
}

/*=============================================
 ASSIGNING METHODS
 Naming convention: resource.action
=============================================*/

Meteor.methods({
  'products.insert'(data) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin === true || user.profile.isManager === true) {
      if (!ProductsData.findOne({ name: data.name })) {
        ProductsData.insert(data);
      } else {
        throw new Meteor.Error('이미 존재하는 업체입니다.');
      }
    }
  },

  // 'products.insertmany'(json) {
  //   console.log(json);
  //   if (!this.userId) {
  //     throw new Meteor.Error('User not logged in!');
  //   }
  //   json.map(account => {
  //     console.log(account);
  //     ProductsData.insert(account);
  //   });
  // },
  //
  // 'products.update'(accountID, data) {
  //   if (!this.userId) {
  //     throw new Meteor.Error('User not logged in!');
  //   }
  //
  //   ProductsData.update({ _id: accountID }, { $set: data });
  // },
  //
  // 'products.remove'(accountID) {
  //   if (!this.userId) {
  //     throw new Meteor.Error('User not logged in!');
  //   }
  //
  //   ProductsData.remove({ _id: accountID });
  // }
});
