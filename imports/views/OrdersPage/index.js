import React from 'react';
import moment from 'moment';

import { subsCache } from '../../../client/main';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';
import { setLayout } from '../../api/setLayout';

import OrderPageHeaderButtons from './OrderPageHeaderButtons';
import OrderSearchExpand from './OrderSearchExpand';
import OrderList from './OrderList';

export default class OrdersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      accountsData: [],
      productsData: [],
      ordersData: [],
      isDataReady: false,
      queryObj: {
        searchFrom: moment()
          .subtract(2, 'weeks')
          .format('YYYY-MM-DD'),
        searchTo: moment().format('YYYY-MM-DD'),
        isPrintQuery: 'both',
        accountName: '',
        productName: '',
        showCompletedOrder: false
      }
    };

    this.onOrderSearchChange = this.onOrderSearchChange.bind(this);
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

      this.setState({ accountsData, productsData, ordersData, isDataReady });
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
  }

  onOrderSearchChange(queryObj) {
    this.setState({ queryObj });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">작업지시목록</h1>
            <OrderPageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              accountsData={this.state.accountsData}
              productsData={this.state.productsData}
              ordersData={this.state.ordersData}
              queryObj={this.state.queryObj}
            />
          </div>

          <OrderSearchExpand onOrderSearchChange={this.onOrderSearchChange} />
        </div>

        <div className="page-content">
          <OrderList
            queryObj={this.state.queryObj}
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
