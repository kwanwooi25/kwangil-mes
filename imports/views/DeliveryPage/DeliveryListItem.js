import React from 'react';
import moment from 'moment';

import { comma, uncomma } from '../../api/comma';
import { countWeekdays } from '../../api/countWeekdays';

import Checkbox from '../../custom/Checkbox';

export default class DeliveryListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  account
  product
  order
  onCheckboxChange
  showAccountDetailView
  showProductDetailView
  showOrderDetailView
  showDeliveryOrderModal
  showConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager
    };

    this.onAccountNameClick = this.onAccountNameClick.bind(this);
    this.onProductNameClick = this.onProductNameClick.bind(this);
    this.onOrderIDClick = this.onOrderIDClick.bind(this);
    this.onCompleteDeliveryClick = this.onCompleteDeliveryClick.bind(this);
    this.onDeliveryOrderClick = this.onDeliveryOrderClick.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      isAdmin: props.isAdmin,
      isManager: props.isManager
    });
  }

  onAccountNameClick(e) {
    const selectedAccountID = e.target.name;
    this.props.showAccountDetailView(selectedAccountID);
  }

  onProductNameClick(e) {
    const selectedProductID = e.target.name;
    this.props.showProductDetailView(selectedProductID);
  }

  onOrderIDClick(e) {
    const selectedOrderID = e.target.textContent;
    this.props.showOrderDetailView(selectedOrderID);
  }

  onCompleteDeliveryClick(e) {
    const selectedOrderID = this.getOrderID(e.target);
    this.props.showConfirmationModal([selectedOrderID]);
  }

  onDeliveryOrderClick(e) {
    const selectedOrderID = this.getOrderID(e.target);
    this.props.showDeliveryOrderModal(selectedOrderID);
  }

  getOrderID(target) {
    if (target.tagName === 'SPAN') {
      return target.parentNode.parentNode.parentNode.id;
    } else if (target.tagName === 'BUTTON') {
      return target.parentNode.parentNode.id;
    }
  }

  render() {
    const account = this.props.account;
    const product = this.props.product;
    const order = this.props.order;
    const deliverBefore = moment(order.data.deliverBefore);
    const daysCount = countWeekdays(moment(), deliverBefore);

    let listClassName = '';
    let productSizeText = '';
    let orderQuantityText = '';
    let completedQuantityText = '';

    listClassName = 'delivery';
    if (order.data.isDelivered) {
      listClassName += ' delivered';
    } else if (daysCount <= 1) {
      listClassName += ' d-1';
    } else if (daysCount <= 3) {
      listClassName += ' d-3';
    }

    productSizeText = `
      ${product.thick} x ${product.length} x ${product.width}
    `;

    const weight =
      Number(product.thick) *
      (Number(product.length) + 5) *
      Number(product.width) /
      100 *
      0.0184 *
      Number(order.data.completedQuantity);

    completedQuantityText = `완성수량: ${comma(
      order.data.completedQuantity
    )}매 (${comma(weight.toFixed(0))}kg)`;

    return (
      <li className={listClassName} key={order._id} id={order._id}>
        {this.state.isAdmin || this.state.isManager ? (
          <div className="delivery-list-item__checkbox-container">
            <Checkbox
              name={order._id}
              onInputChange={this.props.onCheckboxChange}
              disabled={order.data.isDelivered}
            />
          </div>
        ) : (
          undefined
        )}

        <div className="delivery-list-item-container">
          <div className="delivery-list-item__id-container">
            <div className="delivery-list-item__remark-container">
              {order.data.deliverFast ? (
                <span className="delivery-list-item__text">
                  <i className="fa fa-star" /> 지급
                </span>
              ) : (
                undefined
              )}
              {order.data.deliverDateStrict ? (
                <span className="delivery-list-item__text">
                  <i className="fa fa-star" /> 납기엄수
                </span>
              ) : (
                undefined
              )}
            </div>

            <a
              className="delivery-list-item__text delivery-list-item__orderID"
              onClick={this.onOrderIDClick}
            >
              {order._id}
            </a>
          </div>

          <div className="delivery-list-item__dates-container">
            <p className="delivery-list-item__text">
              납기일: {order.data.deliverBefore}
            </p>
          </div>

          <div className="delivery-list-item__product-details-container">
            <div className="delivery-list-item__names-container">
              <a
                name={account._id}
                className="delivery-list-item__subtitle"
                onClick={this.onAccountNameClick}
              >
                {account.name}
              </a>
              <a
                name={product._id}
                className="delivery-list-item__title"
                onClick={this.onProductNameClick}
              >
                {product.name}
              </a>
            </div>
            <div className="delivery-list-item__size-container">
              <p className="delivery-list-item__text">{productSizeText}</p>
              <p className="delivery-list-item__text">
                {completedQuantityText}
              </p>
            </div>
          </div>
        </div>

        {this.state.isAdmin || this.state.isManager ? (
          <div className="delivery-list-item__buttons-container">
            <button
              className="button button-with-icon-span delivery-list-item__button"
              onClick={this.onDeliveryOrderClick}
              disabled={order.data.isDelivered}
            >
              <i className="fa fa-truck fa-lg" />
              <span>출고등록</span>
            </button>
            <button
              className="button button-with-icon-span delivery-list-item__button"
              onClick={this.onCompleteDeliveryClick}
              disabled={order.data.isDelivered}
            >
              <i className="fa fa-check fa-lg" />
              <span>완료</span>
            </button>
          </div>
        ) : (
          undefined
        )}
      </li>
    );
  }
}
