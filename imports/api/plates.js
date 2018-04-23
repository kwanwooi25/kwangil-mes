import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const PlatesData = new Mongo.Collection('plates');

if (Meteor.isServer) {
  Meteor.publish('plates', function() {
    return PlatesData.find();
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

    if (user.profile.isAdmin || user.profile.isManager ) {
      PlatesData.insert(data);
    }
  },
  
  'plates.update'(plateID, data) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    PlatesData.update({ _id: plateID }, { $set: data });
  },

  'plates.remove'(plateID) {
    if (!this.userId) {
      throw new Meteor.Error('User not logged in!');
    }

    PlatesData.remove({ _id: plateID });
  }
});
