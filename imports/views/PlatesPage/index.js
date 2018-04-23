import React from 'react';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { PlatesData } from '../../api/plates';

import PageHeaderSearch from '../components/PageHeaderSearch';
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

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
    this.onPlateSearchChange = this.onPlateSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    this.setLayout();
    window.addEventListener('resize', () => {
      this.setLayout();
    });
    document
      .getElementById('plate-search-toggle')
      .addEventListener('click', () => {
        setTimeout(() => {
          this.setLayout();
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
      Meteor.subscribe('plates');
      const accountsData = AccountsData.find({}, { sort: { name: 1 }}).fetch();
      const productsData = ProductsData.find({}, { sort: { name: 1 }}).fetch();
      const platesData = PlatesData.find({}, { sort: { round: 1 } }).fetch();

      this.setState({
        accountsData,
        productsData,
        platesData
      });
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
    const queryObj = {
      productName: query,
      plateMaterial: '',
      round: '',
      length: ''
    };
    this.setState({ queryObj });
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
            <PageHeaderSearch
              id="plate-search"
              onInputSearchChange={this.onInputSearchChange}
            />

            <PlatePageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              productsData={this.state.productsData}
              platesData={this.state.platesData}
            />
          </div>

          <PlateSearchExpand
            onPlateSearchChange={this.onPlateSearchChange}
          />
        </div>

        <div className="page-content">
          <PlateList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            queryObj={this.state.queryObj}
            accountsData={this.state.accountsData}
            productsData={this.state.productsData}
            platesData={this.state.platesData}
          />
        </div>
      </div>
    );
  }
}
