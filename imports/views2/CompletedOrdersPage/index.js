import React from 'react';
import moment from 'moment';

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
      ordersData: props.ordersData,
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

  onInputSearchChange(query) {
    this.setState({ query }, () => {
      this.filterData();
    });
  }

  filterData() {
    const query = this.state.query;
    let filteredOrdersData = [];

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

      if (
        ((account && account.name.toLowerCase().indexOf(query) > -1) ||
          (product && product.name.toLowerCase().indexOf(query) > -1)) &&
        order.data.isCompleted &&
        !order.data.isDelivered
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
              accountsData={this.props.accountsData}
              productsData={this.props.productsData}
              filteredOrdersData={this.state.filteredOrdersData}
            />
          </div>
        </div>

        <div className="page-content">
          <CompletedOrderList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.props.accountsData}
            productsData={this.props.productsData}
            ordersData={this.props.ordersData}
            filteredOrdersData={this.state.filteredOrdersData}
            isDataReady={this.props.isDataReady}
            query={this.state.query}
          />
        </div>
      </div>
    );
  }
}
