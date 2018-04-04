import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import s3PublicURL from 'node-s3-public-url';

export const ProductsData = new Mongo.Collection('products');
export const ProductImages = new Mongo.Collection('product-images');

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
