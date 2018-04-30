import React from 'react';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { PlatesData } from '../../api/plates';
import { setLayout } from '../../api/setLayout';

import ProductPageHeaderButtons from './ProductPageHeaderButtons';
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
      platesData: [],
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
    setLayout();
    window.addEventListener('resize', () => {
      setLayout();
    });

    //tracks if the user logged in is admin or manager
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
      const accountsData = AccountsData.find({}, { sort: { name: 1 } }).fetch();
      const productsData = ProductsData.find().fetch();
      const platesData = PlatesData.find({}, { sort: { round: 1 } }).fetch();
      this.setState({ accountsData, productsData, platesData });
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
    this.databaseTracker.stop();
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
            <ProductPageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              productsData={this.state.productsData}
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
            platesData={this.state.platesData}
          />
        </div>
      </div>
    );
  }
}
