import React from 'react';
import moment from 'moment';

import { comma, uncomma } from '../../api/comma';
import { countWeekdays } from '../../api/countWeekdays';

import Checkbox from '../../custom/Checkbox';
import AccountName from '../components/AccountName';
import ProductName from '../components/ProductName';
import OrderName from '../components/OrderName';

export default class DeliveryListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  account
  product
  order
  onCheckboxChange
  showConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager
    };

    this.onCompleteDeliveryClick = this.onCompleteDeliveryClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      isAdmin: props.isAdmin,
      isManager: props.isManager
    });
  }

  onCompleteDeliveryClick(e) {
    const selectedOrderID = this.getOrderID(e.target);
    this.props.showConfirmationModal([selectedOrderID], 'complete');
  }

  onDeleteClick(e) {
    const selectedOrderID = this.getOrderID(e.target);
    this.props.showConfirmationModal([selectedOrderID], 'cancel');
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
    let completedQuantityText = '';
    let deliverByText = '';

    listClassName = 'delivery';
    if (order.data.isDelivered) {
      listClassName += ' delivered';
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

    if (order.deliverBy === 'direct') {
      deliverByText = '직납';
    } else if (order.deliverBy === 'post') {
      deliverByText = '택배';
    } else {
      deliverByText = order.deliverBy;
    }

    return (
      <li className={listClassName} key={order._id} id={order._id}>
        {(this.state.isAdmin || this.state.isManager) && (
          <div className="delivery-list-item__checkbox-container">
            <Checkbox
              name={order._id}
              onInputChange={this.props.onCheckboxChange}
              disabled={order.data.isDelivered}
            />
          </div>
        )}

        <div className="delivery-list-item-container">
          <div className="delivery-list-item__details-container">
            <OrderName
              className="delivery-list-item__orderID"
              orderID={order._id}
            />
            <div className="delivery-list-item__names-container">
              <AccountName
                className="delivery-list-item__accountName"
                accountID={account._id}
                accountName={account.name}
              />
              <ProductName
                className="delivery-list-item__productName"
                productID={product._id}
                productName={product.name}
              />
            </div>
            <div className="delivery-list-item__size-container">
              <span className="delivery-list-item__text">{productSizeText}</span>
              <span className="delivery-list-item__text">
                {completedQuantityText}
              </span>
            </div>
          </div>

          <div className="delivery-list-item__deliverBy-container">
            <span className="delivery-list-item__text">{deliverByText}</span>
          </div>
        </div>

        {(this.state.isAdmin || this.state.isManager) && (
          <div className="delivery-list-item__buttons-container">
            <button
              className="button button-with-icon-span delivery-list-item__button"
              onClick={this.onCompleteDeliveryClick}
              disabled={order.data.isDelivered}
            >
              <i className="fa fa-check fa-lg" />
              <span>완료</span>
            </button>
            <button
              className="button button-with-icon-span delivery-list-item__button"
              onClick={this.onDeleteClick}
              disabled={order.data.isDelivered}
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
