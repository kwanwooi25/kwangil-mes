import React from 'react';

import Checkbox from '../../custom/Checkbox';
import AccountName from '../components/AccountName';
import ProductName from '../components/ProductName';

export default class ProductListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isSelected
  isAdmin
  isManager
  account
  product
  onCheckboxChange
  showProductOrderModal
  showProductModal
  showDeleteConfirmationModal
  queryObj
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager
    };

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
    const queryObj = this.props.queryObj;
    const product = this.props.product;
    const account = this.props.account;
    let productThick = String(product.thick);
    let productLength = String(product.length);
    let productWidth = String(product.width);
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

    if (queryObj.thick && productThick.toLowerCase().indexOf(queryObj.thick) > -1) {
      const index = productThick.toLowerCase().indexOf(queryObj.thick);
      const matchingText = productThick.substring(
        index,
        index + queryObj.thick.length
      );
      productThick = productThick.replace(
        matchingText,
        `<span class="highlight">${matchingText}</span>`
      );
    }

    if (
      queryObj.length &&
      productLength.toLowerCase().indexOf(queryObj.length) > -1
    ) {
      const index = productLength.toLowerCase().indexOf(queryObj.length);
      const matchingText = productLength.substring(
        index,
        index + queryObj.length.length
      );
      productLength = productLength.replace(
        matchingText,
        `<span class="highlight">${matchingText}</span>`
      );
    }

    if (queryObj.width && productWidth.toLowerCase().indexOf(queryObj.width) > -1) {
      const index = productWidth.toLowerCase().indexOf(queryObj.width);
      const matchingText = productWidth.substring(
        index,
        index + queryObj.width.length
      );
      productWidth = productWidth.replace(
        matchingText,
        `<span class="highlight">${matchingText}</span>`
      );
    }

    return (
      <li className="product" key={product._id} id={product._id}>
        {this.state.isAdmin || this.state.isManager ? (
          <div className="product-checkbox-container">
            <Checkbox
              name={product._id}
              checked={this.props.isSelected}
              onInputChange={this.props.onCheckboxChange}
            />
          </div>
        ) : (
          undefined
        )}
        <div className="product-container">
          <div className="product-name-container">
            {account ? (
              <AccountName
                className="product-accountName"
                accountID={account._id}
                accountName={account.name}
                query={this.props.queryObj.accountName}
              />
            ) : (
              <div className="product-accountName-container">
                <span className="product-accountName-error">[삭제된 업체]</span>
              </div>
            )}
            <ProductName
              className="product-productName"
              productID={product._id}
              productName={product.name}
              query={this.props.queryObj.name}
            />
          </div>
          <div className="product-details-container">
            <div className="product-size-container">
              <span
                className="product-size__thick"
                dangerouslySetInnerHTML={{ __html: productThick }}
              />
              <i className="fa fa-times" />
              <span
                className="product-size__length"
                dangerouslySetInnerHTML={{ __html: productLength }}
              />
              <i className="fa fa-times" />
              <span
                className="product-size__width"
                dangerouslySetInnerHTML={{ __html: productWidth }}
              />
            </div>
            <div className="product-isPrint-container">
              <span className="product-isPrint">
                {product.isPrint ? `인쇄 ${printText}` : '무지'}
              </span>
            </div>
          </div>
        </div>

        {(this.state.isAdmin || this.state.isManager) && (
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
        )}
      </li>
    );
  }
}
