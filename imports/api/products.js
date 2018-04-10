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

    if (user.profile.isAdmin || user.profile.isManager ) {
      if (
        !ProductsData.findOne({
          accountID: data.accountID,
          name: data.name,
          thick: data.thick,
          length: data.length,
          width: data.width
        })
      ) {
        ProductsData.insert(data);
      } else {
        throw new Meteor.Error('이미 존재하는 품목입니다.');
      }
    }
  },

  'products.insertmany'(json) {
    console.log(json);
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }
    json.map(product => {
      console.log(product);
      ProductsData.insert(product);
    });
  },

  'products.update'(productID, data) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    ProductsData.update({ _id: productID }, { $set: data });
  },

  'products.remove'(productID) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    ProductsData.remove({ _id: productID });
  }
});
