import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';
import { Tracker } from 'meteor/tracker';

import 'react-dates/initialize';
import { routes, onAuthChange } from '../imports/routes/routes';

export const subsCache = new SubsCache(-1, -1);

Tracker.autorun(() => {
  const isAuthenticated = !!Meteor.userId();
  onAuthChange(isAuthenticated);

  subsCache.subscribe('accounts');
  subsCache.subscribe('products');
  subsCache.subscribe('plates');
  subsCache.subscribe('orders');
  subsCache.subscribe('delivery');
  subsCache.subscribe('users');
});

Meteor.startup(() => {
  ReactDOM.render(routes, document.getElementById('root'));
});
