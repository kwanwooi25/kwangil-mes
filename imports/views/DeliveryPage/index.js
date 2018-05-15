import React from 'react';
import moment from 'moment';

import { setLayout } from '../../api/setLayout';
import { avoidWeekend } from '../../api/avoidWeekend';
import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';
import { DeliveryData } from '../../api/delivery';

import PageHeaderSearch from '../components/PageHeaderSearch';
import DeliveryPageHeaderButtons from './DeliveryPageHeaderButtons';
import DeliveryList from './DeliveryList';

export default class DeliveryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      isDataReady: false,
      accountsData: [],
      productsData: [],
      ordersData: [],
      deliveryData: [],
      deliveryDate: avoidWeekend(moment()).format('YYYY-MM-DD')
    };

    this.onDeliveryDateChange = this.onDeliveryDateChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    setLayout(75);
    window.addEventListener('resize', () => {
      setLayout(75);
    });

    // subscribe to data
    subsCache = new SubsCache(-1, -1);
    subsCache.subscribe('accounts');
    subsCache.subscribe('products');
    subsCache.subscribe('orders');
    subsCache.subscribe('delivery');
    this.tracker = Tracker.autorun(() => {
      const isDataReady = subsCache.ready();
      const accountsData = AccountsData.find().fetch();
      const productsData = ProductsData.find().fetch();
      const ordersData = OrdersData.find({}, { sort: { _id: 1 } }).fetch();
      const deliveryData = DeliveryData.find().fetch();
      if (Meteor.user()) {
        this.setState(
          {
            isAdmin: Meteor.user().profile.isAdmin,
            isManager: Meteor.user().profile.isManager,
            isDataReady,
            accountsData,
            productsData,
            ordersData,
            deliveryData
          },
          () => {
            this.filterData();
          }
        );
      }
    });
  }

  componentWillUnmount() {
    this.tracker.stop();
  }

  onDeliveryDateChange(deliveryDate) {
    this.setState({ deliveryDate: deliveryDate.format('YYYY-MM-DD') }, () => {
      this.filterData();
    });
  }

  filterData() {
    const selectedDelivery = this.state.deliveryData.find(
      delivery => delivery._id === this.state.deliveryDate
    );

    this.setState({ selectedDelivery });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">출고목록</h1>
            <DeliveryPageHeaderButtons
              accountsData={this.state.accountsData}
              productsData={this.state.productsData}
              ordersData={this.state.ordersData}
              deliveryData={this.state.deliveryData}
              selectedDelivery={this.state.selectedDelivery}
              onDeliveryDateChange={this.onDeliveryDateChange}
            />
          </div>
        </div>

        <div className="page-content">
          <DeliveryList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.state.accountsData}
            productsData={this.state.productsData}
            ordersData={this.state.ordersData}
            deliveryData={this.state.deliveryData}
            selectedDelivery={this.state.selectedDelivery}
            isDataReady={this.state.isDataReady}
          />
        </div>
      </div>
    );
  }
}
