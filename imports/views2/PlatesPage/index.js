import React from 'react';

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
      platesData: props.platesData,
      filteredPlatesData: [],
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

    this.filterData();
  }

  componentWillReceiveProps(props) {
    this.setState({ platesData: props.platesData }, () => {
      this.filterData();
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
  }

  onPlateSearchChange(queryObj) {
    this.setState({ queryObj }, () => { this.filterData() });
  }

  filterData() {
    const queryObj = this.state.queryObj;
    let filteredPlatesData = [];

    // filter data
    this.state.platesData.map(plate => {
      // store product names in an array
      const productNames = [];
      plate.forProductList.map(({ productID }) => {
        const product = this.props.productsData.find(
          product => product._id === productID
        );
        if (product) {
          productNames.push(product.name);
        }
      });

      let matchProductNameQuery = false;
      let matchRoundQuery = false;
      let matchLengthQuery = false;
      let matchMaterialQuery = false;

      // return true if any of product names contain query text
      productNames.forEach(productName => {
        if (productName.toLowerCase().indexOf(queryObj.productName) > -1) {
          matchProductNameQuery = true;
        }
      });

      if (String(plate.round).indexOf(queryObj.round) > -1) {
        matchRoundQuery = true;
      }

      if (String(plate.length).indexOf(queryObj.length) > -1) {
        matchLengthQuery = true;
      }

      if (queryObj.plateMaterial === 'both') {
        matchMaterialQuery = true;
      } else if (plate.material.indexOf(queryObj.plateMaterial) > -1) {
        matchMaterialQuery = true;
      }

      if (
        matchProductNameQuery &&
        matchRoundQuery &&
        matchLengthQuery &&
        matchMaterialQuery
      ) {
        filteredPlatesData.push(plate);
      }
    });

    this.setState({ filteredPlatesData });
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
              productsData={this.props.productsData}
              filteredPlatesData={this.state.filteredPlatesData}
            />
          </div>

          <PlateSearchExpand onPlateSearchChange={this.onPlateSearchChange} />
        </div>

        <div className="page-content">
          <PlateList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            productsData={this.props.productsData}
            platesData={this.props.platesData}
            filteredPlatesData={this.state.filteredPlatesData}
            isDataReady={this.props.isDataReady}
            queryObj={this.state.queryObj}
          />
        </div>
      </div>
    );
  }
}
