import React from 'react';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';

import Checkbox from '../../custom/Checkbox';
import ProductDetailView from './ProductDetailView';
import ProductOrderModal from './ProductOrderModal';
import ProductModal from './ProductModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class ProductList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query object to filter product list
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      accountList: [],
      data: [],
      queryObj: props.queryObj,
      isAdmin: false,
      isManager: false,
      isProductOrderModalOpen: false,
      isProductModalOpen: false,
      isDetailViewOpen: false,
      isDeleteConfirmModalOpen: false,
      selectedProductID: '',
      selectedProductName: '',
      selectedProductSize: '',
      productsCount: 0
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onNameClick = this.onNameClick.bind(this);
    this.onDetailViewClose = this.onDetailViewClose.bind(this);
    this.onProductOrderClick = this.onProductOrderClick.bind(this);
    this.onProductOrderModalClose = this.onProductOrderModalClose.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onProductModalClose = this.onProductModalClose.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onDeleteConfirmModalClose = this.onDeleteConfirmModalClose.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({ queryObj: props.queryObj });
  }

  componentDidMount() {
    // tracks data change
    this.databaseTracker = Tracker.autorun(() => {
      Meteor.subscribe('accounts');
      Meteor.subscribe('products');
      const accountList = AccountsData.find(
        {},
        { fields: { _id: 1, name: 1 } }
      ).fetch();
      const productList = ProductsData.find({}, { sort: { name: 1 } }).fetch();

      this.setState({
        accountList,
        data: productList,
        productsCount: productList.length
      });
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
    this.databaseTracker.stop();
    this.authTracker.stop();
  }

  onInputChange(e) {
    if (e.target.name === 'selectAll') {
      const checkboxes = document.querySelectorAll(
        '#product-list input[type="checkbox"]'
      );

      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = e.target.checked;
      }
    }
  }

  // show detail view modal
  onNameClick(e) {
    const selectedProductID = e.target.parentNode.parentNode.parentNode.id;
    this.setState({
      isDetailViewOpen: true,
      selectedProductID
    });
  }

  onDetailViewClose() {
    this.setState({ isDetailViewOpen: false });
  }

  // show product order modal
  onProductOrderClick(e) {
    let selectedProductID = '';
    if (e.target.tagName === 'SPAN') {
      selectedProductID = e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'BUTTON') {
      selectedProductID = e.target.parentNode.parentNode.id;
    }

    this.setState({
      isProductOrderModalOpen: true,
      selectedProductID
    });
  }

  onProductOrderModalClose() {
    this.setState({ isProductOrderModalOpen: false });
  }

  // show account modal (EDIT mode)
  onEditClick(e) {
    let selectedProductID = '';
    if (e.target.tagName === 'SPAN') {
      selectedProductID = e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'BUTTON') {
      selectedProductID = e.target.parentNode.parentNode.id;
    }

    this.setState({
      isProductModalOpen: true,
      selectedProductID
    });
  }

  onProductModalClose() {
    this.setState({ isProductModalOpen: false });
  }

  // show confirmation modal before delete
  onDeleteClick(e) {
    let selectedProductID = '';
    if (e.target.tagName === 'SPAN') {
      selectedProductID = e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'BUTTON') {
      selectedProductID = e.target.parentNode.parentNode.id;
    }
    const selectedProduct = ProductsData.findOne({ _id: selectedProductID });
    const selectedProductName = selectedProduct.name;
    const selectedProductSize = `
      ${selectedProduct.thick} x
      ${selectedProduct.length} x
      ${selectedProduct.width}
    `
    this.setState({
      isDeleteConfirmModalOpen: true,
      selectedProductID,
      selectedProductName,
      selectedProductSize
    });
  }

  onDeleteConfirmModalClose(answer) {
    this.setState({ isDeleteConfirmModalOpen: false });

    if (answer) {
      Meteor.call('products.remove', this.state.selectedProductID);
    }
  }

  getProductList(queryObj) {
    return this.state.data.map(product => {
      const account = this.state.accountList.find(
        account => account._id === product.accountID
      );
      let print = '';
      if (product.printFrontColorCount) {
        if (product.printBackColorCount) {
          print = `(전면 ${product.printFrontColorCount}도, 후면 ${
            product.printBackColorCount
          }도)`;
        } else {
          print = `(전면 ${product.printFrontColorCount}도)`;
        }
      }

      let matchQuery = false;

      if (
        product.accountName &&
        product.accountName.indexOf(queryObj.accountName) > -1 &&
        product.name &&
        product.name.indexOf(queryObj.name) > -1 &&
        product.thick &&
        product.thick.indexOf(queryObj.thick) > -1 &&
        product.length &&
        product.length.indexOf(queryObj.length) > -1 &&
        product.width &&
        product.width.indexOf(queryObj.width) > -1 &&
        product.extColor &&
        product.extColor.indexOf(queryObj.extColor) > -1
      ) {
        if (queryObj.printColor) {
          if (product.isPrint) {
            if (
              (product.printFrontColor &&
                product.printFrontColor.indexOf(queryObj.printColor) > -1) ||
              (product.printBackColor &&
                product.printBackColor.indexOf(queryObj.printColor) > -1)
            ) {
              matchQuery = true;
            }
          }
        } else {
          matchQuery = true;
        }
      }

      // only show product that has matching query text
      if (matchQuery) {
        return (
          <li className="product" key={product._id} id={product._id}>
            <div className="product-checkbox-container">
              <Checkbox name={product._id} onInputChange={this.onInputChange} />
            </div>
            <div className="product-container">
              <div className="product-name-container">
                <span className="product-accountName">{account.name}</span>
                <a className="product-name" onClick={this.onNameClick}>
                  {product.name}
                </a>
              </div>
              <div className="product-details-container">
                <div className="product-size-container">
                  <span className="product-size__thick">{product.thick}</span>
                  <i className="fa fa-times" />
                  <span className="product-size__length">{product.length}</span>
                  <i className="fa fa-times" />
                  <span className="product-size__width">{product.width}</span>
                </div>
                <div className="product-isPrint-container">
                  <span className="product-isPrint">
                    {product.isPrint ? `인쇄 ${print}` : '무지'}
                  </span>
                </div>
              </div>
            </div>

            {this.state.isAdmin || this.state.isManager ? (
              <div className="product-buttons-container">
                <button
                  className="button-circle product-button"
                  onClick={this.onProductOrderClick}
                >
                  <i className="fa fa-industry fa-lg" />
                  <span>작업지시</span>
                </button>
                <button
                  className="button-circle product-button"
                  onClick={this.onEditClick}
                >
                  <i className="fa fa-edit fa-lg" />
                  <span>수정</span>
                </button>
                <button
                  className="button-circle product-button"
                  onClick={this.onDeleteClick}
                >
                  <i className="fa fa-trash fa-lg" />
                  <span>삭제</span>
                </button>
              </div>
            ) : (
              undefined
            )}
          </li>
        );
      }
    });
  }

  render() {
    return (
      <ul id="product-list">
        {this.state.productsCount &&
          (this.state.isAdmin || this.state.isManager) ? (
            <div className="product-select-all">
              <Checkbox
                name="selectAll"
                label="전체선택"
                onInputChange={this.onInputChange}
              />
            </div>
          ) : (
            undefined
          )}

        {this.getProductList(this.state.queryObj)}
        {this.state.isDetailViewOpen ? (
          <ProductDetailView
            isOpen={this.state.isDetailViewOpen}
            productID={this.state.selectedProductID}
            onDetailViewClose={this.onDetailViewClose}
          />
        ) : (
          undefined
        )}
        {this.state.isProductOrderModalOpen ? (
          <ProductOrderModal
            isOpen={this.state.isProductOrderModalOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.onProductOrderModalClose}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        ) : (
          undefined
        )}
        {this.state.isProductModalOpen ? (
          <ProductModal
            isOpen={this.state.isProductModalOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.onProductModalClose}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        ) : (
          undefined
        )}
        {this.state.isDeleteConfirmModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmModalOpen}
            title="품목 삭제"
            descriptionArray={[
              '아래 품목을 삭제하시겠습니까?',
              this.state.selectedProductName,
              this.state.selectedProductSize
            ]}
            onModalClose={this.onDeleteConfirmModalClose}
          />
        ) : (
          undefined
        )}
      </ul>
    );
  }
}
