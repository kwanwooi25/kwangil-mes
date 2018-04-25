import React from 'react';
import moment from 'moment';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';

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
      query: ''
    };

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    this.setLayout();
    window.addEventListener('resize', () => {
      this.setLayout();
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
      const accountsData = AccountsData.find({}, { sort: { name: 1 } }).fetch();
      const productsData = ProductsData.find({}, { sort: { name: 1 } }).fetch();
      const ordersData = OrdersData.find({}, { sort: { _id: 1 } }).fetch();

      this.setState({ accountsData, productsData, ordersData });
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
    this.databaseTracker.stop();
  }

  // dynamically adjust height
  setLayout() {
    const headerHeight = document
      .querySelector('.header')
      .getBoundingClientRect().height;
    const pageHeaderHeight = document
      .querySelector('.page-header')
      .getBoundingClientRect().height;
    const main = document.querySelector('.main');
    const pageContent = document.querySelector('.page-content');
    const mainHeight = `calc(100vh - ${headerHeight + 10}px)`;
    const contentHeight = `calc(100vh - ${headerHeight +
      25 +
      pageHeaderHeight}px)`;
    main.style.height = mainHeight;
    main.style.marginTop = `${headerHeight + 5}px`;
    pageContent.style.height = contentHeight;
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
            <DeliveryPageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              accountsData={this.state.accountsData}
              productsData={this.state.productsData}
              ordersData={this.state.ordersData}
            />
          </div>
        </div>

        <div className="page-content">
          <DeliveryList
            query={this.state.query}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.state.accountsData}
            productsData={this.state.productsData}
            ordersData={this.state.ordersData}
          />
        </div>
      </div>
    );
  }
}
