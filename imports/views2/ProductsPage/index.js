import React from 'react';

import { setLayout } from '../../api/setLayout';
import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';

import ProductPageHeaderButtons from './ProductPageHeaderButtons';
import ProductSearchExpand from './ProductSearchExpand';
import ProductList from './ProductList';

export default class ProductsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      isDataReady: false,
      accountsData: [],
      productsData: [],
      filteredProductsData: [],
      queryObj: {
        accountName: '',
        name: '',
        thick: '',
        length: '',
        width: '',
        extColor: '',
        printColor: ''
      }
    };

    this.onProductSearchChange = this.onProductSearchChange.bind(this);
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

    this.tracker = Tracker.autorun(() => {
      if (Meteor.user()) {
        const isDataReady = subsCache.ready();
        const accountsData = AccountsData.find().fetch();
        const productsData = ProductsData.find().fetch();
        this.setState({
          isAdmin: Meteor.user().profile.isAdmin,
          isManager: Meteor.user().profile.isManager,
          isDataReady,
          accountsData,
          productsData
        }, () => { this.filterData() });
      }
    });
  }

  componentWillUnmount() {
    this.tracker.stop();
  }

  onProductSearchChange(queryObj) {
    this.setState({ queryObj }, () => {
      this.filterData();
    });
  }

  filterData() {
    const queryObj = this.state.queryObj;
    let filteredProductsData = [];

    // filter data
    if (this.state.isDataReady) {
      this.state.productsData.map(product => {
        const account = this.state.accountsData.find(
          account => account._id === product.accountID
        );

        let accountNameMatch = false;
        let productNameMatch = false;
        let productSizeMatch = false;
        let extColorMatch = false;
        let printColorMatch = false;

        if (
          account &&
          account.name.toLowerCase().indexOf(queryObj.accountName) > -1
        ) {
          accountNameMatch = true;
        }

        if (
          product.name &&
          product.name.toLowerCase().indexOf(queryObj.name) > -1
        ) {
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
          product.extColor &&
          product.extColor.toLowerCase().indexOf(queryObj.extColor) > -1
        ) {
          extColorMatch = true;
        }

        if (queryObj.printColor && product.isPrint) {
          if (
            (product.printFrontColor &&
              product.printFrontColor.indexOf(queryObj.printColor) > -1) ||
            (product.printBackColor &&
              product.printBackColor.indexOf(queryObj.printColor) > -1)
          ) {
            printColorMatch = true;
          }
        } else {
          printColorMatch = true;
        }

        if (
          accountNameMatch &&
          productNameMatch &&
          productSizeMatch &&
          extColorMatch &&
          printColorMatch
        ) {
          filteredProductsData.push(product);
        }
      });

      this.setState({ filteredProductsData });
    }
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">제품목록</h1>
            <ProductPageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              accountsData={this.state.accountsData}
              filteredProductsData={this.state.filteredProductsData}
            />
          </div>

          <ProductSearchExpand
            onProductSearchChange={this.onProductSearchChange}
          />
        </div>

        <div className="page-content">
          <ProductList
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            accountsData={this.state.accountsData}
            productsData={this.state.productsData}
            filteredProductsData={this.state.filteredProductsData}
            isDataReady={this.state.isDataReady}
            queryObj={this.state.queryObj}
          />
        </div>
      </div>
    );
  }
}
