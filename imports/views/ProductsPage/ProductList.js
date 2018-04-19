import React from 'react';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';

import Checkbox from '../../custom/Checkbox';
import ProductListItem from './ProductListItem';
import AccountDetailView from '../AccountsPage/AccountDetailView';
import ProductDetailView from './ProductDetailView';
import ProductOrderModal from './ProductOrderModal';
import ProductModal from './ProductModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class ProductList extends React.Component {
  /*=========================================================================
  >> props <<
  queryObj : query object to filter product list
  isAdmin
  isManager
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      accountList: [],
      productsData: [],
      queryObj: props.queryObj,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      isAccountDetailViewOpen: false,
      isProductOrderModalOpen: false,
      isProductModalOpen: false,
      isProductDetailViewOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedProductID: '',
      confirmationDescription: [],
      productsCount: 0,
      isSelectedMulti: false,
      selectedProducts: [],
      deleteMode: ''
    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.showAccountDetailView = this.showAccountDetailView.bind(this);
    this.hideAccountDetailView = this.hideAccountDetailView.bind(this);
    this.showProductDetailView = this.showProductDetailView.bind(this);
    this.hideProductDetailView = this.hideProductDetailView.bind(this);
    this.showProductOrderModal = this.showProductOrderModal.bind(this);
    this.hideProductOrderModal = this.hideProductOrderModal.bind(this);
    this.showProductModal = this.showProductModal.bind(this);
    this.hideProductModal = this.hideProductModal.bind(this);
    this.showDeleteConfirmationModal = this.showDeleteConfirmationModal.bind(
      this
    );
    this.hideDeleteConfirmationModal = this.hideDeleteConfirmationModal.bind(
      this
    );
    this.onDeleteMultiClick = this.onDeleteMultiClick.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      queryObj: props.queryObj,
      isAdmin: props.isAdmin,
      isManager: props.isManager
    });
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
        productsData: productList,
        productsCount: productList.length
      });
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
  }

  onCheckboxChange(e) {
    let selectedProducts = this.state.selectedProducts;
    if (e.target.name === 'selectAll') {
      selectedProducts = [];
      const checkboxes = document.querySelectorAll(
        '#product-list input[type="checkbox"]'
      );

      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = e.target.checked;
        if (e.target.checked) {
          selectedProducts.push(checkboxes[i].name);
        }
      }
    } else {
      selectedProducts = selectedProducts.filter(
        value => value !== e.target.name
      );
      if (e.target.checked) {
        selectedProducts.push(e.target.name);
      }
    }
    selectedProducts = selectedProducts.filter(value => value !== 'selectAll');
    if (selectedProducts.length >= 2) {
      this.setState({ isSelectedMulti: true });
    } else {
      this.setState({ isSelectedMulti: false });
    }
    this.setState({ selectedProducts });
  }

  showAccountDetailView(selectedAccountID) {
    this.setState({
      isAccountDetailViewOpen: true,
      selectedAccountID
    });
  }

  hideAccountDetailView() {
    this.setState({ isAccountDetailViewOpen: false });
  }

  showProductDetailView(selectedProductID) {
    this.setState({
      isProductDetailViewOpen: true,
      selectedProductID
    });
  }

  hideProductDetailView() {
    this.setState({ isProductDetailViewOpen: false });
  }

  // show product order modal
  showProductOrderModal(selectedProductID) {
    this.setState({
      isProductOrderModalOpen: true,
      selectedProductID
    });
  }

  hideProductOrderModal() {
    this.setState({ isProductOrderModalOpen: false });
  }

  // show account modal (EDIT mode)
  showProductModal(selectedProductID) {
    this.setState({
      isProductModalOpen: true,
      selectedProductID
    });
  }

  hideProductModal() {
    this.setState({ isProductModalOpen: false });
  }

  // show confirmation modal before delete
  showDeleteConfirmationModal(selectedProducts) {
    let confirmationDescription = [];

    if (selectedProducts.length === 1) {
      confirmationDescription = ['품목을 삭제하시겠습니까?'];
    } else {
      confirmationDescription = [
        `${selectedProducts.length}개 품목 삭제하시겠습니까?`
      ];
    }

    selectedProducts.map(productID => {
      const product = ProductsData.findOne({ _id: productID });
      let productInfoText = `
          ${product.name} (${product.thick}x${product.length}x${product.width})
        `;
      confirmationDescription.push(productInfoText);
    });

    this.setState({
      isDeleteConfirmationModalOpen: true,
      selectedProducts,
      confirmationDescription
    });
  }

  hideDeleteConfirmationModal(answer) {
    this.setState({ isDeleteConfirmationModalOpen: false });

    if (answer) {
      this.state.selectedProducts.map(productID => {
        Meteor.call('products.remove', productID);
      });
    }
  }

  onDeleteMultiClick() {
    this.showDeleteConfirmationModal(this.state.selectedProducts);
  }

  getProductList(queryObj) {
    return this.state.productsData.map(product => {
      const account = this.state.accountList.find(
        account => account._id === product.accountID
      );

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
          <ProductListItem
            key={product._id}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            account={account}
            product={product}
            onCheckboxChange={this.onCheckboxChange}
            showAccountDetailView={this.showAccountDetailView}
            showProductDetailView={this.showProductDetailView}
            showProductOrderModal={this.showProductOrderModal}
            showProductModal={this.showProductModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        );
      }
    });
  }

  render() {
    return (
      <ul id="product-list">
        {this.state.productsCount &&
          (this.state.isAdmin || this.state.isManager) ? (
            <div className="product-list-header">
              <Checkbox
                name="selectAll"
                label="전체선택"
                onInputChange={this.onCheckboxChange}
              />
              <div className="product-buttons-container">
                <button
                  className="button button-with-icon-span product-button"
                onClick={this.onDeleteMultiClick}
                disabled={!this.state.isSelectedMulti}
              >
                <i className="fa fa-trash fa-lg" />
                <span>삭제</span>
              </button>
            </div>
          </div>
        ) : (
          undefined
        )}

        {this.getProductList(this.state.queryObj)}

        {this.state.isAccountDetailViewOpen ? (
          <AccountDetailView
            isOpen={this.state.isAccountDetailViewOpen}
            accountID={this.state.selectedAccountID}
            onModalClose={this.hideAccountDetailView}
          />
        ) : (
          undefined
        )}

        {this.state.isProductDetailViewOpen ? (
          <ProductDetailView
            isOpen={this.state.isProductDetailViewOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.hideProductDetailView}
          />
        ) : (
          undefined
        )}

        {this.state.isProductOrderModalOpen ? (
          <ProductOrderModal
            isOpen={this.state.isProductOrderModalOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.hideProductOrderModal}
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
            onModalClose={this.hideProductModal}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        ) : (
          undefined
        )}

        {this.state.isDeleteConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="품목 삭제"
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        ) : (
          undefined
        )}
      </ul>
    );
  }
}
