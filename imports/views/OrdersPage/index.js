import React from 'react';
import moment from 'moment';

import OrderPageHeaderButtons from './OrderPageHeaderButtons';
import OrderSearchExpand from './OrderSearchExpand';
import OrderList from './OrderList';

export default class OrdersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
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
  }

  componentWillUnmount() {
    this.authTracker.stop();
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
            />
          </div>

          <OrderSearchExpand onOrderSearchChange={this.onOrderSearchChange}/>
        </div>

        <div className="page-content">
          <OrderList
            queryObj={this.state.queryObj}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        </div>
      </div>
    );
  }
}
