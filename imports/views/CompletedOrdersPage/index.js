import React from 'react';
import moment from 'moment';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';
import { DeliveryData } from '../../api/delivery';
import { setLayout } from '../../api/setLayout';

import PageHeaderSearch from '../components/PageHeaderSearch';
import CompletedOrdersPageHeaderButtons from './CompletedOrdersPageHeaderButtons';
import CompletedOrderList from './CompletedOrderList';

export default class CompletedOrdersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      accountsData: [],
      productsData: [],
      ordersData: [],
      deliveryData: [],
      isDataReady: false,
      query: ''
    };

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    setLayout(75);
    window.addEventListener('resize', () => {
      setLayout(75);
    });

    // tracks if the user logged in is admin or manager
    this.authTracker = Tracker.autorun(() => {
      if (Meteor.user()) {
        this.setState({
          isAdmin: Meteor.user().profile.isAdmin,
          isManager: Meteor.user().profile.isManager
        });
      }
    });

    // tracks data change
    this.databaseTracker = Tracker.autorun(() => {
      const accountsSubscription = Meteor.subscribe('accounts');
      const productsSubscription = Meteor.subscribe('products');
      const ordersSubscription = Meteor.subscribe('orders');
      const deliverySubscription = Meteor.subscribe('delivery');
      const accountsData = AccountsData.find().fetch();
      const productsData = ProductsData.find().fetch();
      const ordersData = OrdersData.find().fetch();
      const deliveryData = DeliveryData.find().fetch();
      const isDataReady =
        accountsSubscription.ready() &&
        productsSubscription.ready() &&
        ordersSubscription.ready() &&
        deliverySubscription.ready();

      this.setState({
        accountsData,
        productsData,
        ordersData,
        deliveryData,
        isDataReady
      });
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
    this.databaseTracker.stop();
  }

  onInputSearchChange(query) {
    this.setState({ query });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">납품대기목록</h1>
            <PageHeaderSearch onInputSearchChange={this.onInputSearchChange} />
            <CompletedOrdersPageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              accountsData={this.state.accountsData}
              productsData={this.state.productsData}
              ordersData={this.state.ordersData}
              query={this.state.query}
            />
          </div>
        </div>

        <div className="page-content">
          <CompletedOrderList
            query={this.state.query}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.state.accountsData}
            productsData={this.state.productsData}
            ordersData={this.state.ordersData}
            isDataReady={this.state.isDataReady}
          />
        </div>
      </div>
    );
  }
}
