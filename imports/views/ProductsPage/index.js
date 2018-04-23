import React from 'react';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';

import ProductPageHeaderButtons from './ProductPageHeaderButtons';
import PageHeaderSearch from '../components/PageHeaderSearch';
import ProductSearchExpand from './ProductSearchExpand';
import ProductList from './ProductList';

export default class ProductsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      accountsData: [],
      productsData: [],
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

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
    this.onProductSearchChange = this.onProductSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    this.setLayout();
    window.addEventListener('resize', () => {
      this.setLayout();
    });
    document
      .getElementById('product-search-toggle')
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
      const accountsData = AccountsData.find({}, { sort: { name: 1 } }).fetch();
      const productsData = ProductsData.find({}, { sort: { name: 1 } }).fetch();

      this.setState({ accountsData, productsData });
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
      accountName: '',
      name: query,
      thick: '',
      length: '',
      width: '',
      extColor: '',
      printColor: ''
    };
    this.setState({ queryObj });
  }

  onProductSearchChange(queryObj) {
    this.setState({ queryObj });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">제품목록</h1>
            <PageHeaderSearch
              id="product-search"
              onInputSearchChange={this.onInputSearchChange}
            />

            <ProductPageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
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
            queryObj={this.state.queryObj}
            accountsData={this.state.accountsData}
            productsData={this.state.productsData}
          />
        </div>
      </div>
    );
  }
}
