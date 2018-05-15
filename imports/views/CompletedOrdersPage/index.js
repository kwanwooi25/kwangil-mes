import React from 'react';
import moment from 'moment';

import { setLayout } from '../../api/setLayout';
import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';

import PageHeaderSearch from '../components/PageHeaderSearch';
import CompletedOrdersPageHeaderButtons from './CompletedOrdersPageHeaderButtons';
import CompletedOrderList from './CompletedOrderList';

export default class CompletedOrdersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      isDataReady: false,
      accountsData: [],
      productsData: [],
      ordersData: [],
      filteredOrdersData: [],
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

    // subscribe to data
    subsCache = new SubsCache(-1, -1);
    subsCache.subscribe('accounts');
    subsCache.subscribe('products');
    subsCache.subscribe('orders');

    this.tracker = Tracker.autorun(() => {
      if (Meteor.user()) {
        const isDataReady = subsCache.ready();
        const accountsData = AccountsData.find().fetch();
        const productsData = ProductsData.find().fetch();
        const ordersData = OrdersData.find({}, { sort: { _id: 1 } }).fetch();
        this.setState(
          {
            isAdmin: Meteor.user().profile.isAdmin,
            isManager: Meteor.user().profile.isManager,
            isDataReady,
            accountsData,
            productsData,
            ordersData
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

  onInputSearchChange(query) {
    this.setState({ query }, () => {
      this.filterData();
    });
  }

  filterData() {
    const query = this.state.query;
    let filteredOrdersData = [];

    this.state.ordersData.map(order => {
      const product = this.state.productsData.find(
        product => product._id === order.productID
      );
      let account;
      if (product) {
        account = this.state.accountsData.find(
          account => account._id === product.accountID
        );
      }

      if (
        ((account && account.name.toLowerCase().indexOf(query) > -1) ||
          (product && product.name.toLowerCase().indexOf(query) > -1)) &&
        order.isCompleted &&
        !order.isDelivered
      ) {
        filteredOrdersData.push(order);
      }
    });

    this.setState({ filteredOrdersData });
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
              filteredOrdersData={this.state.filteredOrdersData}
            />
          </div>
        </div>

        <div className="page-content">
          <CompletedOrderList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.state.accountsData}
            productsData={this.state.productsData}
            ordersData={this.state.ordersData}
            filteredOrdersData={this.state.filteredOrdersData}
            isDataReady={this.state.isDataReady}
            query={this.state.query}
          />
        </div>
      </div>
    );
  }
}
