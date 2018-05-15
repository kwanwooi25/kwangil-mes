import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import { ProductsData } from './products';
import { AccountsData } from './accounts';

export const OrdersData = new Mongo.Collection('orders');
export const OrderCounter = new Mongo.Collection('orderCounter');

if (Meteor.isServer) {
  Meteor.publish('orders', function() {
    const ordersData = OrdersData.find().fetch();
    ordersData.map(order => {
      const product = ProductsData.findOne({ _id: order.productID });
      if (!product) {
        Meteor.call('orders.remove', order._id);
      } else {
        const account = AccountsData.findOne({ _id: product.accountID });
        if (!account) {
          Meteor.call('orders.remove', order._id);
        }
      }
    });

    return OrdersData.find({}, { sort: { _id: 1 } });
  });
  Meteor.publish('orderCounter', function() {
    return OrderCounter.find();
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
    const getNextSequence = counterID => {
      if (OrderCounter.findOne({ _id: counterID })) {
        OrderCounter.update({ _id: counterID }, { $inc: { seq: 1 } });
      } else {
        OrderCounter.insert({ _id: counterID, seq: 1 });
      }
      return OrderCounter.findOne({ _id: counterID }).seq;
    };

    if (user.profile.isAdmin || user.profile.isManager) {
      const counterID = data.orderedAt.substring(0, 7);
      const seq = getNextSequence(counterID);
      data._id = `${counterID}-${('00' + seq).slice(-3)}`;
      OrdersData.insert(data);
    }
  },

  'orders.update'(orderID, data) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    OrdersData.update({ _id: orderID }, { $set: data });
  },

  'orders.remove'(orderID) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin || user.profile.isManager) {
      OrdersData.remove({ _id: orderID });
    }
  }
});

OrdersData.schema = new SimpleSchema({
  productID: { type: String },
  orderedAt: { type: String },
  deliverBefore: { type: String },
  orderQuantity: { type: Number },
  deliverDateStrict: { type: Boolean, defaultValue: false },
  deliverFast: { type: Boolean, defaultValue: false },
  plateStatus: { type: String, defaultValue: '' },
  workMemo: { type: String, optional: true },
  deliverMemo: { type: String, optional: true },
  status: { type: String, defaultValue: 'extruding' }, // 'extruding' > 'printing' > 'cutting' > 'completed'
  isCompleted: { type: Boolean, defaultValue: false },
  isDelivered: { type: Boolean, defaultValue: false },
  completedQuantity: { type: Number, defaultValue: 0 },
  completedAt: { type: String, defaultValue: '' },
  deliveredAt: { type: String, defaultValue: '' }
});
