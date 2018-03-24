/*=============================================
 IMPORTS LIBRARIES
=============================================*/
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

/*=============================================
 IMPORTS COMPONENTS
=============================================*/
import LoginPage from '../views/LoginPage';
import RegisterPage from '../views/RegisterPage';
// import Header from '../views/components/Header';
// import Navigation from '../views/components/Navigation';
// import DashboardPage from '../views/DashboardPage';
// import AccountsPage from '../views/AccountsPage';
// import ProductsPage from '../views/ProductsPage';
import NotFoundPage from '../views/NotFoundPage';

const unauthenticatedPages = ['/', '/register'];
const authenticatedPages = ['/dashboard', '/accounts', '/products', '/orders'];

const Header = () => <h3>Header</h3>;
const Navigation = () => <h3>Navigation</h3>;
const DashboardPage = () => <h3>DashboardPage</h3>;
const AccountsPage = () => <h3>AccountsPage</h3>;
const ProductsPage = () => <h3>ProductsPage</h3>;
const OrdersPage = () => <h3>OrdersPage</h3>;

export const routes = (
  <BrowserRouter>
    <div>
      {!!Meteor.userId() ? (
        <header>
          <Header />
          <Navigation />
        </header>
      ) : (
        undefined
      )}
      <Switch>
        <Route exact path="/" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/accounts" component={AccountsPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="*" component={NotFoundPage} />
      </Switch>
    </div>
  </BrowserRouter>
);

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
