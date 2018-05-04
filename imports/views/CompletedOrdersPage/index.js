import React from 'react';
import moment from 'moment';

import { subsCache } from '../../../client/main';

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
    Tracker.autorun(() => {
      const isDataReady = subsCache.ready();
      const accountsData = AccountsData.find({}, { sort: { name: 1 } }).fetch();
      const productsData = ProductsData.find(
        {},
        {
          sort: { name: 1, thick: 1, length: 1, width: 1 }
        }
      ).fetch();
      const ordersData = OrdersData.find({}, { sort: { _id: 1 } }).fetch();
      const deliveryData = DeliveryData.find({}, { sort: { _id: 1 } }).fetch();

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
