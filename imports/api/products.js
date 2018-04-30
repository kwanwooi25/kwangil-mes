import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import s3PublicURL from 'node-s3-public-url';

export const ProductsData = new Mongo.Collection('products');

if (Meteor.isServer) {
  Meteor.publish('products', function() {
    return ProductsData.find({}, {
      sort: { name: 1, thick: 1, length: 1, width: 1 }
    });
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
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }
    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin || user.profile.isManager ) {
      json.map(product => {

        // for numbers
        product.thick = Number(product.thick);
        product.length = Number(product.length);
        product.width = Number(product.width);
        product.printFrontColorCount = Number(product.printFrontColorCount) || 0;
        product.printBackColorCount = Number(product.printBackColorCount) || 0;
        product.cutPunchCount = Number(product.cutPunchCount) || 0;
        product.packQuantity = Number(product.packQuantity) || 0;
        product.stockQuantity = Number(product.stockQuantity) || 0;
        product.price = Number(product.price) || 0;

        // for boolean
        product.isPrint = product.isPrint === "TRUE" ? true : false;
        product.extAntistatic = product.extAntistatic === "TRUE" ? true : false;
        product.cutUltrasonic = product.cutUltrasonic === "TRUE" ? true : false;
        product.cutPowderPack = product.cutPowderPack === "TRUE" ? true : false;
        product.cutPunches = product.cutPunches === "TRUE" ? true : false;
        product.packDeliverAll = product.packDeliverAll === "TRUE" ? true : false;

        ProductsData.insert(product);
      });
    }
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

ProductsData.schema = new SimpleSchema({
  accountID: {type: String},
  name: {type: String},
  thick: {type: Number},
  length: {type: Number},
  width: {type: Number},
  isPrint: {type: Boolean},
  extColor: {type: String},
  extAntistatic: {type: Boolean, defaultValue: false, optional: true},
  extPretreat: {type: String, defaultValue: '', optional: true},
  extMemo: {type: String, defaultValue: '', optional: true},
  printImageFileName: {type: String, defaultValue: '', optional: true},
  printImageURL: {type: String, defaultValue: '', optional: true},
  printFrontColorCount: {type: Number, defaultValue: 0, optional: true},
  printFrontColor: {type: String, defaultValue: '', optional: true},
  printFrontPosition: {type: String, defaultValue: '', optional: true},
  printBackColorCount: {type: Number, defaultValue: 0, optional: true},
  printBackColor: {type: String, defaultValue: '', optional: true},
  printBackPosition: {type: String, defaultValue: '', optional: true},
  printMemo: {type: String, defaultValue: '', optional: true},
  cutPosition: {type: String, defaultValue: '', optional: true},
  cutUltrasonic: {type: Boolean, defaultValue: false, optional: true},
  cutPowderPack: {type: Boolean, defaultValue: false, optional: true},
  cutPunches: {type: Boolean, defaultValue: false, optional: true},
  cutPunchCount: {type: Number, defaultValue: 0, optional: true},
  cutPunchSize: {type: String, defaultValue: '', optional: true},
  cutPunchPosition: {type: String, defaultValue: '', optional: true},
  cutMemo: {type: String, defaultValue: '', optional: true},
  packMaterial: {type: String, defaultValue: '', optional: true},
  packQuantity: {type: Number, defaultValue: 0, optional: true},
  packDeliverAll: {type: Boolean, defaultValue: false, optional: true},
  packMemo: {type: String, defaultValue: '', optional: true},
  price: {type: Number, defaultValue: 0, optional: true},
  stockQuantity : {type: Number, defaultValue: 0, optional: true},
  olderHistory: {type:String, optional: true},
  memo: {type: String, defaultValue: '', optional: true},
})
