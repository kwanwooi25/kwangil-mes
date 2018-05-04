import React from 'react';

import { subsCache } from '../../../client/main';

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
      const platesData = PlatesData.find({}, { sort: { round: 1 } }).fetch();

      this.setState({ accountsData, productsData, platesData, isDataReady });
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
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
              queryObj={this.state.queryObj}
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
