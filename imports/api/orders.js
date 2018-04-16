import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const OrdersData = new Mongo.Collection('orders');
export const OrderCounter = new Mongo.Collection('orderCounter');

if (Meteor.isServer) {
  Meteor.publish('orders', function() {
    return OrdersData.find();
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
      const orderID = `${counterID}-${('00' + seq).slice(-3)}`;
      OrdersData.insert({ _id: orderID, data });
    }
  },
  
  'orders.update'(orderID, data) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    OrdersData.update({ _id: orderID }, { data });
  },

  'orders.remove'(orderID) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    OrdersData.remove({ _id: orderID });
  }
});
