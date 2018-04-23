import React from 'react';

import Checkbox from '../../custom/Checkbox';

export default class ProductListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  account
  product
  onCheckboxChange
  showAccountDetailView
  showProductDetailView
  showProductOrderModal
  showProductModal
  showDeleteConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager
    };

    this.onAccountNameClick = this.onAccountNameClick.bind(this);
    this.onProductNameClick = this.onProductNameClick.bind(this);
    this.onProductOrderClick = this.onProductOrderClick.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      isAdmin: props.isAdmin,
      isManager: props.isManager
    });
  }

  onAccountNameClick(e) {
    selectedAccountID = e.target.name;
    this.props.showAccountDetailView(selectedAccountID);
  }

  onProductNameClick(e) {
    const selectedProductID = e.target.parentNode.parentNode.parentNode.id;
    this.props.showProductDetailView(selectedProductID);
  }

  onProductOrderClick(e) {
    const selectedProductID = this.getProductID(e.target);
    this.props.showProductOrderModal(selectedProductID);
  }

  onEditClick(e) {
    const selectedProductID = this.getProductID(e.target);
    this.props.showProductModal(selectedProductID);
  }

  onDeleteClick(e) {
    const selectedProductID = this.getProductID(e.target);
    this.props.showDeleteConfirmationModal([selectedProductID]);
  }

  getProductID(target) {
    if (target.tagName === 'SPAN') {
      return target.parentNode.parentNode.parentNode.id;
    } else if (target.tagName === 'BUTTON') {
      return target.parentNode.parentNode.id;
    }
  }

  render() {
    const product = this.props.product;
    const account = this.props.account;
    let printText = '';
    if (product.printFrontColorCount) {
      if (product.printBackColorCount) {
        printText = `(전면 ${product.printFrontColorCount}도, 후면 ${
          product.printBackColorCount
        }도)`;
      } else {
        printText = `(전면 ${product.printFrontColorCount}도)`;
      }
    }

    return (
      <li className="product" key={product._id} id={product._id}>
        <div className="product-checkbox-container">
          <Checkbox
            name={product._id}
            onInputChange={this.props.onCheckboxChange}
          />
        </div>
        <div className="product-container">
          <div className="product-name-container">
            <a
              name={account._id}
              className="product-accountName"
              onClick={this.onAccountNameClick}
            >
              {account.name}
            </a>
            <a className="product-name" onClick={this.onProductNameClick}>
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
                {product.isPrint ? `인쇄 ${printText}` : '무지'}
              </span>
            </div>
          </div>
        </div>

        {this.state.isAdmin || this.state.isManager ? (
          <div className="product-buttons-container">
            <button
              className="button button-with-icon-span product-button"
              onClick={this.onProductOrderClick}
            >
              <i className="fa fa-industry fa-lg" />
              <span>작업지시</span>
            </button>
            <button
              className="button button-with-icon-span product-button"
              onClick={this.onEditClick}
            >
              <i className="fa fa-edit fa-lg" />
              <span>수정</span>
            </button>
            <button
              className="button button-with-icon-span product-button"
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
}