import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const PlatesData = new Mongo.Collection('plates');
const PlateCounter = new Mongo.Collection('plateCounter');

if (Meteor.isServer) {
  Meteor.publish('plates', function() {
    return PlatesData.find({}, { sort: { round: 1 } });
  });
  Meteor.publish('plateCounter', function() {
    return PlateCounter.find();
  });
}

/*=============================================
 ASSIGNING METHODS
 Naming convention: resource.action
=============================================*/

Meteor.methods({
  'plates.insert'(data) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    const user = Meteor.users.findOne(this.userId);
    const getNextSequence = () => {
      if (PlateCounter.findOne({ _id: 'plateCounter' })) {
        PlateCounter.update({ _id: 'plateCounter' }, { $inc: { seq: 1}});
      } else {
        PlateCounter.insert({ _id: 'plateCounter', seq: 1 });
      }
      return PlateCounter.findOne({ _id: 'plateCounter' }).seq;
    }

    if (user.profile.isAdmin || user.profile.isManager) {
      const seq = getNextSequence();
      data._id = ('00000' + seq).slice(-6);
      PlatesData.insert(data);
    }
  },

  'plates.insertmany'(json) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }
    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin || user.profile.isManager) {
      json.map(plate => {
        PlatesData.insert(product);
      });
    }
  },

  'plates.update'(plateID, data) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin || user.profile.isManager) {
      PlatesData.update({ _id: plateID }, { $set: data });
    }
  },

  'plates.remove'(plateID) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    const user = Meteor.users.findOne(this.userId);

    if (user.profile.isAdmin || user.profile.isManager) {
      PlatesData.remove({ _id: plateID });
    }
  }
});

PlatesData.schema = new SimpleSchema({
  round: { type: Number },
  length: { type: Number },
  material: { type: String },
  location: { type: String, optional: true },
  forProductList: { type: Object }, // [ productID, content ],
  history: { type: Object, optional: true }, // [ date, memo ]
  memo: { type: String, optional: true }
});
