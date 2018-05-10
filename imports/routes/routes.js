/*=============================================
 IMPORTS LIBRARIES
=============================================*/
import { Meteor } from 'meteor/meteor';
import { UserStatus } from 'meteor/ostrio:user-status';
import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

/*=============================================
 IMPORTS COMPONENTS
=============================================*/
import LoginPage from '../views/LoginPage';
import Header from '../views/components/Header';
import DashboardPage from '../views/DashboardPage';
import AccountsPage from '../views/AccountsPage';
import ProductsPage from '../views/ProductsPage';
import PlatesPage from '../views/PlatesPage';
import OrdersPage from '../views/OrdersPage';
import CompletedOrdersPage from '../views/CompletedOrdersPage';
import DeliveryPage from '../views/DeliveryPage';
import UsersPage from '../views/UsersPage';
import NotFoundPage from '../views/NotFoundPage';

import Spinner from '../custom/Spinner-2';

const unauthenticatedPages = ['/'];
const authenticatedPages = [
  '/dashboard',
  '/accounts',
  '/products',
  '/plates',
  '/orders',
  '/orders-completed',
  '/delivery',
  '/users'
];

// watch user's authentication for conditional routing
export const onAuthChange = isAuthenticated => {
  const pathname = location.pathname;
  const IsUnauthenticatedPage = unauthenticatedPages.includes(pathname);
  const IsAuthenticatedPage = authenticatedPages.includes(pathname);

  if (IsUnauthenticatedPage && isAuthenticated) {
    location.pathname = '/dashboard';
  } else if (IsAuthenticatedPage && !isAuthenticated) {
    location.pathname = '/';
  }
};

export default class Routes extends React.Component {
  componentDidMount() {
    let idleTimer = null;
    // tracks data change
    Tracker.autorun(() => {
      // logout user when user has been idle for 1 hour
      if (UserStatus.status.get() === 'idle') {
        idleTimer = setTimeout(() => {
          Accounts.logout();
        }, 3600000);
      } else if (UserStatus.status.get() === 'online') {
        clearTimeout(idleTimer);
      }
    });
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          {!!Meteor.userId() ? <Header /> : undefined}
          <Switch>
            <Route exact path="/" component={LoginPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/accounts" component={AccountsPage} />
            <Route path="/products" component={ProductsPage} />
            <Route path="/plates" component={PlatesPage} />
            <Route path="/orders" component={OrdersPage} />
            <Route path="/orders-completed" component={CompletedOrdersPage} />
            <Route path="/delivery" component={DeliveryPage} />
            <Route path="/users" component={UsersPage} />
            <Route path="*" component={NotFoundPage} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}
