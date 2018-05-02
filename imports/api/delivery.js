import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { OrdersData } from './orders';

export const DeliveryData = new Mongo.Collection('delivery');

if (Meteor.isServer) {
  Meteor.publish('delivery', function() {
    const deliveryData = DeliveryData.find().fetch();
    deliveryData.map(delivery => {
      let newOrderList = [];
      delivery.orderList.map(listItem => {
        const order = OrdersData.findOne({ _id: listItem.orderID });
        if (order) {
          newOrderList.push(listItem);
        }
      });
      Meteor.call('delivery.update', delivery._id, newOrderList);
    })
    return DeliveryData.find({}, { sort: { _id: 1 } });
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
