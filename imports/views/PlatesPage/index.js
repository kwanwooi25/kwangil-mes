import React from 'react';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { PlatesData } from '../../api/plates';
import { setLayout } from '../../api/setLayout';

import PlatePageHeaderButtons from './PlatePageHeaderButtons';
import PlateSearchExpand from './PlateSearchExpand';
import PlateList from './PlateList';

export default class PlatesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      accountsData: [],
      productsData: [],
      platesData: [],
      queryObj: {
        productName: '',
        plateMaterial: '',
        round: '',
        length: ''
      }
    };

    this.onPlateSearchChange = this.onPlateSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    setLayout();
    window.addEventListener('resize', () => {
      setLayout();
    });
    document
      .getElementById('plate-search-toggle')
      .addEventListener('click', () => {
        setTimeout(() => {
          setLayout();
        }, 0);
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
      const platesSubscription = Meteor.subscribe('plates');
      const accountsData = AccountsData.find().fetch();
      const productsData = ProductsData.find().fetch();
      const platesData = PlatesData.find().fetch();
      const isDataReady = platesSubscription.ready();

      this.setState({ accountsData, productsData, platesData, isDataReady });
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
    this.databaseTracker.stop();
  }

  onPlateSearchChange(queryObj) {
    this.setState({ queryObj });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">동판목록</h1>
            <PlatePageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              productsData={this.state.productsData}
              platesData={this.state.platesData}
            />
          </div>

          <PlateSearchExpand onPlateSearchChange={this.onPlateSearchChange} />
        </div>

        <div className="page-content">
          <PlateList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            queryObj={this.state.queryObj}
            accountsData={this.state.accountsData}
            productsData={this.state.productsData}
            platesData={this.state.platesData}
            isDataReady={this.state.isDataReady}
          />
        </div>
      </div>
    );
  }
}
