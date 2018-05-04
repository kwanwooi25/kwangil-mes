import React from 'react';

import Spinner from '../../custom/Spinner';
import Checkbox from '../../custom/Checkbox';
import ProductListItem from './ProductListItem';
import ProductOrderModal from './ProductOrderModal';
import ProductModal from './ProductModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class ProductList extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  accountsData
  filteredProductsData
  isDataReady
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      itemsToShow: 20,
      isProductOrderModalOpen: false,
      isProductModalOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedProductID: '',
      confirmationDescription: [],
      isSelectedMulti: false,
      selectedProducts: []
    };

    this.onListScroll = this.onListScroll.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
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

  onListScroll(e) {
    const list = e.target;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight) {
      let itemsToShow = this.state.itemsToShow;
      itemsToShow += 20;
      this.setState({ itemsToShow }, () => {
        this.getProductList(this.state.queryObj);
      });
    }
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
    let confirmationDescription = [
      `${selectedProducts.length}개 품목 삭제하시겠습니까?`
    ];

    selectedProducts.map(productID => {
      const product = this.props.filteredProductsData.find(
        product => product._id === productID
      );
      let productInfoText = `${product.name} (${product.thick}x${
        product.length
      }x${product.width})`;
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

      // reset selectAll checkbox
      document.querySelector('input[name="selectAll"]').checked = false;

      // reset selectedProducts array
      this.setState({ selectedProducts: [] });
    }
  }

  onDeleteMultiClick() {
    this.showDeleteConfirmationModal(this.state.selectedProducts);
  }

  getProductList() {
    return this.props.filteredProductsData
      .slice(0, this.state.itemsToShow)
      .map(product => {
        const account = this.props.accountsData.find(
          account => account._id === product.accountID
        );

        return (
          <ProductListItem
            key={product._id}
            isAdmin={this.props.isAdmin}
            isManager={this.props.isManager}
            account={account}
            product={product}
            onCheckboxChange={this.onCheckboxChange}
            showProductOrderModal={this.showProductOrderModal}
            showProductModal={this.showProductModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        );
      });
  }

  render() {
    return (
      <div className="list-container">
        {this.props.isAdmin || this.props.isManager ? (
          <div className="list-header">
            <Checkbox
              name="selectAll"
              label="전체선택"
              onInputChange={this.onCheckboxChange}
            />
            <div className="list-header-buttons-container">
              <button
                className="button button-with-icon-span list-header-button"
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

        <ul id="product-list" className="list" onScroll={this.onListScroll}>
          {this.props.isDataReady ? (
            this.getProductList()
          ) : (
            <Spinner />
          )}
        </ul>

        {this.state.isProductOrderModalOpen && (
          <ProductOrderModal
            isOpen={this.state.isProductOrderModalOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.hideProductOrderModal}
            isAdmin={this.props.isAdmin}
            isManager={this.props.isManager}
          />
        )}

        {this.state.isProductModalOpen && (
          <ProductModal
            isOpen={this.state.isProductModalOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.hideProductModal}
            isAdmin={this.props.isAdmin}
            isManager={this.props.isManager}
          />
        )}

        {this.state.isDeleteConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="품목 삭제"
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        )}
      </div>
    );
  }
}
