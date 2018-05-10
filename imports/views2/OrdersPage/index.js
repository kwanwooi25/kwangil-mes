import React from 'react';
import moment from 'moment';

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
      ordersData: props.ordersData,
      filteredOrdersData: [],
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

    this.filterData();
  }

  componentWillReceiveProps(props) {
    this.setState({ ordersData: props.ordersData }, () => {
      this.filterData();
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
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
      const product = this.props.productsData.find(
        product => product._id === order.data.productID
      );
      let account;
      if (product) {
        account = this.props.accountsData.find(
          account => account._id === product.accountID
        );
      }

      let dateRangeMatch = false;
      let accountNameMatch = false;
      let productNameMatch = false;
      let isPrintMatch = false;
      let showCompletedMatch = false;

      const orderedAt = moment(order.data.orderedAt);
      const searchFrom = moment(queryObj.searchFrom);
      const searchTo = moment(queryObj.searchTo);

      if (searchFrom <= orderedAt && orderedAt <= searchTo) {
        dateRangeMatch = true;
      }

      if (account && account.name.indexOf(queryObj.accountName) > -1) {
        accountNameMatch = true;
      }

      if (product && product.name.indexOf(queryObj.productName) > -1) {
        productNameMatch = true;
      }

      if (
        queryObj.isPrintQuery === 'both' ||
        (queryObj.isPrintQuery === 'false' && !product.isPrint) ||
        (queryObj.isPrintQuery === 'true' && product.isPrint)
      ) {
        isPrintMatch = true;
      }

      if (
        !order.data.isCompleted ||
        (order.data.isCompleted && queryObj.showCompletedOrder)
      ) {
        showCompletedMatch = true;
      }

      if (
        dateRangeMatch &&
        accountNameMatch &&
        productNameMatch &&
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
              accountsData={this.props.accountsData}
              productsData={this.props.productsData}
              filteredOrdersData={this.state.filteredOrdersData}
            />
          </div>

          <OrderSearchExpand onOrderSearchChange={this.onOrderSearchChange} />
        </div>

        <div className="page-content">
          <OrderList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.props.accountsData}
            productsData={this.props.productsData}
            ordersData={this.props.ordersData}
            filteredOrdersData={this.state.filteredOrdersData}
            isDataReady={this.props.isDataReady}
            queryObj={this.state.queryObj}
          />
        </div>
      </div>
    );
  }
}
