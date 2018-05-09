/*=============================================
 IMPORTS LIBRARIES
=============================================*/
import { Meteor } from 'meteor/meteor';
import { UserStatus } from 'meteor/ostrio:user-status';
import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

/*=============================================
 IMPORTS DATA COLLECTIONS
=============================================*/
import { AccountsData } from '../api/accounts';
import { ProductsData } from '../api/products';
import { PlatesData } from '../api/plates';
import { OrdersData } from '../api/orders';
import { DeliveryData } from '../api/delivery';

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
  constructor(props) {
    super(props);

    this.state = {
      isAccountsDataReady: false,
      isProductsDataReady: false,
      isPlatesDataReady: false,
      isOrdersDataReady: false,
      isDeliveryDataReady: false,
      accountsData: [],
      productsData: [],
      platesData: [],
      ordersData: [],
      deliveryData: []
    };
  }

  componentDidMount() {
    // data subscription
    const accountsSubscription = Meteor.subscribe('accounts');
    const productsSubscription = Meteor.subscribe('products');
    const platesSubscription = Meteor.subscribe('plates');
    const ordersSubscription = Meteor.subscribe('orders');
    const deliverySubscription = Meteor.subscribe('delivery');
    const usersSubscription = Meteor.subscribe('users');

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

      // tracks data change when user is logged in
      if (Meteor.user()) {
        const isAccountsDataReady = accountsSubscription.ready();
        const isProductsDataReady = productsSubscription.ready();
        const isPlatesDataReady = platesSubscription.ready();
        const isOrdersDataReady = ordersSubscription.ready();
        const isDeliveryDataReady = deliverySubscription.ready();
        const isUsersDataReady = usersSubscription.ready();

        const accountsCursor = AccountsData.find({}, { sort: { name: 1 } });
        const productsCursor = ProductsData.find(
          {},
          {
            sort: { name: 1, thick: 1, length: 1, width: 1 }
          }
        );
        const platesCursor = PlatesData.find({}, { sort: { round: 1 } });
        const ordersCursor = OrdersData.find({}, { sort: { _id: 1 } });
        const deliveryCursor = DeliveryData.find({}, { sort: { _id: 1 } });

        const accountsData = accountsCursor.fetch();
        const productsData = productsCursor.fetch();
        const platesData = platesCursor.fetch();
        const ordersData = ordersCursor.fetch();
        const deliveryData = deliveryCursor.fetch();

        this.setState({
          isAccountsDataReady,
          isProductsDataReady,
          isPlatesDataReady,
          isOrdersDataReady,
          isDeliveryDataReady,
          accountsData,
          productsData,
          platesData,
          ordersData,
          deliveryData
        });
      }
    });
  }

  render() {
    if (
      this.state.isAccountsDataReady &&
      this.state.isProductsDataReady &&
      this.state.isPlatesDataReady &&
      this.state.isOrdersDataReady &&
      this.state.isDeliveryDataReady
    ) {
      return (
        <BrowserRouter>
          <div>
            {!!Meteor.userId() ? <Header /> : undefined}
            <Switch>
              <Route exact path="/" component={LoginPage} />
              <Route
                path="/dashboard"
                render={() => (
                  <DashboardPage
                    isDataReady={
                      this.state.isProductsDataReady &&
                      this.state.isOrdersDataReady
                    }
                    productsData={this.state.productsData}
                    ordersData={this.state.ordersData}
                    deliveryData={this.state.deliveryData}
                  />
                )}
              />
              <Route
                path="/accounts"
                render={() => (
                  <AccountsPage
                    isDataReady={this.state.isAccountsDataReady}
                    accountsData={this.state.accountsData}
                    accountsDataChange={this.state.accountsDataChange}
                  />
                )}
              />
              <Route
                path="/products"
                render={() => (
                  <ProductsPage
                    isDataReady={
                      this.state.isAccountsDataReady &&
                      this.state.isProductsDataReady &&
                      this.state.isPlatesDataReady
                    }
                    accountsData={this.state.accountsData}
                    productsData={this.state.productsData}
                    platesData={this.state.platesData}
                  />
                )}
              />
              <Route
                path="/plates"
                render={() => (
                  <PlatesPage
                    isDataReady={
                      this.state.isAccountsDataReady &&
                      this.state.isProductsDataReady &&
                      this.state.isPlatesDataReady
                    }
                    accountsData={this.state.accountsData}
                    productsData={this.state.productsData}
                    platesData={this.state.platesData}
                  />
                )}
              />
              <Route
                path="/orders"
                render={() => (
                  <OrdersPage
                    isDataReady={
                      this.state.isAccountsDataReady &&
                      this.state.isProductsDataReady &&
                      this.state.isOrdersDataReady
                    }
                    accountsData={this.state.accountsData}
                    productsData={this.state.productsData}
                    ordersData={this.state.ordersData}
                  />
                )}
              />
              <Route
                path="/orders-completed"
                render={() => (
                  <CompletedOrdersPage
                    isDataReady={
                      this.state.isAccountsDataReady &&
                      this.state.isProductsDataReady &&
                      this.state.isOrdersDataReady &&
                      this.state.isDeliveryDataReady
                    }
                    accountsData={this.state.accountsData}
                    productsData={this.state.productsData}
                    ordersData={this.state.ordersData}
                    deliveryData={this.state.deliveryData}
                  />
                )}
              />
              <Route
                path="/delivery"
                render={() => (
                  <DeliveryPage
                    isDataReady={
                      this.state.isAccountsDataReady &&
                      this.state.isProductsDataReady &&
                      this.state.isOrdersDataReady &&
                      this.state.isDeliveryDataReady
                    }
                    accountsData={this.state.accountsData}
                    productsData={this.state.productsData}
                    ordersData={this.state.ordersData}
                    deliveryData={this.state.deliveryData}
                  />
                )}
              />
              <Route path="/users" component={UsersPage} />
              <Route path="*" component={NotFoundPage} />
            </Switch>
          </div>
        </BrowserRouter>
      );
    } else {
      return <Spinner />;
    }
  }

  // render() {
  //   return (
  //     <BrowserRouter>
  //       <div>
  //         {!!Meteor.userId() ? <Header /> : undefined}
  //         <Switch>
  //           <Route exact path="/" component={LoginPage} />
  //           <Route
  //             path="/dashboard"
  //             render={() => (
  //               <DashboardPage
  //                 isDataReady={
  //                   this.state.isProductsDataReady &&
  //                   this.state.isOrdersDataReady
  //                 }
  //                 productsData={this.state.productsData}
  //                 ordersData={this.state.ordersData}
  //                 deliveryData={this.state.deliveryData}
  //               />
  //             )}
  //           />
  //           <Route
  //             path="/accounts"
  //             render={() => (
  //               <AccountsPage
  //                 isDataReady={this.state.isAccountsDataReady}
  //                 accountsData={this.state.accountsData}
  //                 accountsDataChange={this.state.accountsDataChange}
  //               />
  //             )}
  //           />
  //           <Route
  //             path="/products"
  //             render={() => (
  //               <ProductsPage
  //                 isDataReady={
  //                   this.state.isAccountsDataReady &&
  //                   this.state.isProductsDataReady &&
  //                   this.state.isPlatesDataReady
  //                 }
  //                 accountsData={this.state.accountsData}
  //                 productsData={this.state.productsData}
  //                 platesData={this.state.platesData}
  //               />
  //             )}
  //           />
  //           <Route
  //             path="/plates"
  //             render={() => (
  //               <PlatesPage
  //                 isDataReady={
  //                   this.state.isAccountsDataReady &&
  //                   this.state.isProductsDataReady &&
  //                   this.state.isPlatesDataReady
  //                 }
  //                 accountsData={this.state.accountsData}
  //                 productsData={this.state.productsData}
  //                 platesData={this.state.platesData}
  //               />
  //             )}
  //           />
  //           <Route
  //             path="/orders"
  //             render={() => (
  //               <OrdersPage
  //                 isDataReady={
  //                   this.state.isAccountsDataReady &&
  //                   this.state.isProductsDataReady &&
  //                   this.state.isOrdersDataReady
  //                 }
  //                 accountsData={this.state.accountsData}
  //                 productsData={this.state.productsData}
  //                 ordersData={this.state.ordersData}
  //               />
  //             )}
  //           />
  //           <Route
  //             path="/orders-completed"
  //             render={() => (
  //               <CompletedOrdersPage
  //                 isDataReady={
  //                   this.state.isAccountsDataReady &&
  //                   this.state.isProductsDataReady &&
  //                   this.state.isOrdersDataReady &&
  //                   this.state.isDeliveryDataReady
  //                 }
  //                 accountsData={this.state.accountsData}
  //                 productsData={this.state.productsData}
  //                 ordersData={this.state.ordersData}
  //                 deliveryData={this.state.deliveryData}
  //               />
  //             )}
  //           />
  //           <Route
  //             path="/delivery"
  //             render={() => (
  //               <DeliveryPage
  //                 isDataReady={
  //                   this.state.isAccountsDataReady &&
  //                   this.state.isProductsDataReady &&
  //                   this.state.isOrdersDataReady &&
  //                   this.state.isDeliveryDataReady
  //                 }
  //                 accountsData={this.state.accountsData}
  //                 productsData={this.state.productsData}
  //                 ordersData={this.state.ordersData}
  //                 deliveryData={this.state.deliveryData}
  //               />
  //             )}
  //           />
  //           <Route path="/users" component={UsersPage} />
  //           <Route path="*" component={NotFoundPage} />
  //         </Switch>
  //       </div>
  //     </BrowserRouter>
  //   );
  // }
}
