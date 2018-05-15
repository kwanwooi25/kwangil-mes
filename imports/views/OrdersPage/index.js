import React from 'react';
import moment from 'moment';

import { setLayout } from '../../api/setLayout';
import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';

import OrderPageHeaderButtons from './OrderPageHeaderButtons';
import OrderSearchExpand from './OrderSearchExpand';
import OrderList from './OrderList';

export default class OrdersPage extends React.Component {
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
      queryObj: {
        searchFrom: moment()
          .subtract(2, 'weeks')
          .format('YYYY-MM-DD'),
        searchTo: moment().format('YYYY-MM-DD'),
        isPrintQuery: 'both',
        accountName: '',
        productName: '',
        thick: '',
        length: '',
        width: '',
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
        const ordersData = OrdersData.find().fetch();
        this.setState({
          isAdmin: Meteor.user().profile.isAdmin,
          isManager: Meteor.user().profile.isManager,
          isDataReady,
          accountsData,
          productsData,
          ordersData
        }, () => { this.filterData() });
      }
    });
  }

  componentWillUnmount() {
    this.tracker.stop();
  }

  onOrderSearchChange(queryObj) {
    this.setState({ queryObj }, () => {
      this.filterData();
    });
  }

  filterData() {
    const queryObj = this.state.queryObj;
    let filteredOrdersData = [];

    // filter data
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

      let dateRangeMatch = false;
      let accountNameMatch = false;
      let productNameMatch = false;
      let productSizeMatch = false;
      let isPrintMatch = false;
      let showCompletedMatch = false;

      const orderedAt = moment(order.orderedAt);
      const searchFrom = moment(queryObj.searchFrom);
      const searchTo = moment(queryObj.searchTo);

      if (searchFrom <= orderedAt && orderedAt <= searchTo) {
        dateRangeMatch = true;
      }

      if (account && account.name.toLowerCase().indexOf(queryObj.accountName) > -1) {
        accountNameMatch = true;
      }

      if (product && product.name.toLowerCase().indexOf(queryObj.productName) > -1) {
        productNameMatch = true;
      }

      if (
        product.thick &&
        String(product.thick).indexOf(queryObj.thick) > -1 &&
        product.length &&
        String(product.length).indexOf(queryObj.length) > -1 &&
        product.width &&
        String(product.width).indexOf(queryObj.width) > -1
      ) {
        productSizeMatch = true;
      }

      if (
        queryObj.isPrintQuery === 'both' ||
        (queryObj.isPrintQuery === 'false' && !product.isPrint) ||
        (queryObj.isPrintQuery === 'true' && product.isPrint)
      ) {
        isPrintMatch = true;
      }

      if (
        !order.isCompleted ||
        (order.isCompleted && queryObj.showCompletedOrder)
      ) {
        showCompletedMatch = true;
      }

      if (
        dateRangeMatch &&
        accountNameMatch &&
        productNameMatch &&
        productSizeMatch &&
        isPrintMatch &&
        showCompletedMatch
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
            <h1 className="page-header__title">작업지시목록</h1>
            <OrderPageHeaderButtons
              accountsData={this.state.accountsData}
              productsData={this.state.productsData}
              filteredOrdersData={this.state.filteredOrdersData}
            />
          </div>

          <OrderSearchExpand onOrderSearchChange={this.onOrderSearchChange} />
        </div>

        <div className="page-content">
          <OrderList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.state.accountsData}
            productsData={this.state.productsData}
            ordersData={this.state.ordersData}
            filteredOrdersData={this.state.filteredOrdersData}
            isDataReady={this.state.isDataReady}
            queryObj={this.state.queryObj}
          />
        </div>
      </div>
    );
  }
}
