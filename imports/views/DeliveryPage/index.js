import React from 'react';
import moment from 'moment';

import { setLayout } from '../../api/setLayout';
import { avoidWeekend } from '../../api/avoidWeekend';

import PageHeaderSearch from '../components/PageHeaderSearch';
import DeliveryPageHeaderButtons from './DeliveryPageHeaderButtons';
import DeliveryList from './DeliveryList';

export default class DeliveryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      deliveryData: props.deliveryData,
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
    this.setState({ deliveryData: props.deliveryData }, () => {
      this.filterData();
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
  }

  onDeliveryDateChange(deliveryDate) {
    this.setState({ deliveryDate: deliveryDate.format('YYYY-MM-DD') }, () => {
      this.filterData();
    });
  }

  filterData() {
    const selectedDelivery = this.props.deliveryData.find(
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
              accountsData={this.props.accountsData}
              productsData={this.props.productsData}
              ordersData={this.props.ordersData}
              selectedDelivery={this.state.selectedDelivery}
              onDeliveryDateChange={this.onDeliveryDateChange}
            />
          </div>
        </div>

        <div className="page-content">
          <DeliveryList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.props.accountsData}
            productsData={this.props.productsData}
            ordersData={this.props.ordersData}
            deliveryData={this.props.deliveryData}
            selectedDelivery={this.state.selectedDelivery}
            isDataReady={this.props.isDataReady}
          />
        </div>
      </div>
    );
  }
}
