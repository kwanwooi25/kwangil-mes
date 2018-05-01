import React from 'react';
import moment from 'moment';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';
import { DeliveryData } from '../../api/delivery';
import { setLayout } from '../../api/setLayout';

import PageHeaderSearch from '../components/PageHeaderSearch';
import DeliveryPageHeaderButtons from './DeliveryPageHeaderButtons';
import DeliveryList from './DeliveryList';

export default class DeliveryPage extends React.Component {
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
      deliveryDate: moment().format('YYYY-MM-DD')
    };

    this.onDeliveryDateChange = this.onDeliveryDateChange.bind(this);
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
      Meteor.subscribe('accounts');
      Meteor.subscribe('products');
      Meteor.subscribe('orders');
      const deliverySubscription = Meteor.subscribe('delivery');
      const accountsData = AccountsData.find().fetch();
      const productsData = ProductsData.find().fetch();
      const ordersData = OrdersData.find().fetch();
      const deliveryData = DeliveryData.find().fetch();
      const isDataReady = deliverySubscription.ready();

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

  onDeliveryDateChange(deliveryDate) {
    this.setState({ deliveryDate: deliveryDate.format('YYYY-MM-DD') });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">출고목록</h1>
            <DeliveryPageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              accountsData={this.state.accountsData}
              productsData={this.state.productsData}
              ordersData={this.state.ordersData}
              onDeliveryDateChange={this.onDeliveryDateChange}
            />
          </div>
        </div>

        <div className="page-content">
          <DeliveryList
            deliveryDate={this.state.deliveryDate}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.state.accountsData}
            productsData={this.state.productsData}
            ordersData={this.state.ordersData}
            deliveryData={this.state.deliveryData}
            isDataReady={this.state.isDataReady}
          />
        </div>
      </div>
    );
  }
}
