import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const OrdersData = new Mongo.Collection('orders');

if (Meteor.isServer) {
  Meteor.publish('orders', function() {
    return OrdersData.find();
  });
}

/*=============================================
 ASSIGNING METHODS
 Naming convention: resource.action
=============================================*/

Meteor.methods({
  'orders.insert'(data) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin || user.profile.isManager) {
      OrdersData.insert(data);
    }
  }

  // 'orders.insertmany'(json) {
  //   console.log(json);
  //   if (!this.userId) {
  //     throw new Meteor.Error('User not logged in!');
  //   }
  //   json.map(product => {
  //     console.log(product);
  //     OrdersData.insert(product);
  //   });
  // },
  //
  // 'orders.update'(productID, data) {
  //   if (!this.userId) {
  //     throw new Meteor.Error('User not logged in!');
  //   }
  //
  //   OrdersData.update({ _id: productID }, { $set: data });
  // },
  //
  // 'orders.remove'(productID) {
  //   if (!this.userId) {
  //     throw new Meteor.Error('User not logged in!');
  //   }
  //
  //   OrdersData.remove({ _id: productID });
  // }
});
