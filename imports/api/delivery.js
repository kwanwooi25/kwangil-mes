import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const DeliveryData = new Mongo.Collection('delivery');

if (Meteor.isServer) {
  Meteor.publish('delivery', function() {
    return DeliveryData.find();
  });
}

/*=============================================
 ASSIGNING METHODS
 Naming convention: resource.action
=============================================*/

Meteor.methods({
  'delivery.insert'(deliveryDate, orderList) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    DeliveryData.insert({ _id: deliveryDate, orderList });
  },

  'delivery.update'(deliveryDate, orderList) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    DeliveryData.update({ _id: deliveryDate }, { orderList });
  },
  //
  // 'delivery.remove'(orderID) {
  //   if (!this.userId) {
  //     throw new Meteor.Error('User not logged in!');
  //   }
  //
  //   OrdersData.remove({ _id: orderID });
  // }
});
