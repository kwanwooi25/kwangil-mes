import React from 'react';

import { comma, uncomma } from '../../api/comma';
import { printOrders } from '../../api/printOrders';

import Checkbox from '../../custom/Checkbox';

export default class OrderListItem extends React.Component {
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
  updateOrderStatus
  showCompleteOrderModal
  showProductOrderModal
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
    this.onOrderIDClick = this.onOrderIDClick.bind(this);
    this.onStatusChange = this.onStatusChange.bind(this);
    this.onPrintOrderClick = this.onPrintOrderClick.bind(this);
    this.onCompleteOrderClick = this.onCompleteOrderClick.bind(this);
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

  onStatusChange(e) {
    const orderID = e.target.parentNode.parentNode.parentNode.id;
    const statusValue = e.target.value;
    this.props.updateOrderStatus(orderID, statusValue);
  }

  onPrintOrderClick(e) {
    const selectedOrderID = this.getOrderID(e.target);
    printOrders([selectedOrderID]);
  }

  onCompleteOrderClick(e) {
    const selectedOrderID = this.getOrderID(e.target);
    this.props.showCompleteOrderModal([selectedOrderID]);
  }

  onEditClick(e) {
    const selectedOrderID = this.getOrderID(e.target);
    this.props.showProductOrderModal(selectedOrderID);
  }

  onDeleteClick(e) {
    const selectedOrderID = this.getOrderID(e.target);
    this.props.showDeleteConfirmationModal([selectedOrderID]);
  }

  getOrderID(target) {
    if (target.tagName === 'SPAN') {
      return target.parentNode.parentNode.parentNode.parentNode.id;
    } else if (target.tagName === 'BUTTON') {
      return target.parentNode.parentNode.parentNode.id;
    }
  }

  render() {
    const account = this.props.account;
    const product = this.props.product;
    const order = this.props.order;

    let listClassName = 'order';
    if (order.data.isCompleted) {
      listClassName += ' completed';
    }

    let isPrintText = '무지';
    if (product.isPrint) {
      isPrintText = '인쇄';
      switch (order.data.plateStatus) {
        case 'confirm':
          isPrintText += ' (동판확인)';
          break;
        case 'new':
          isPrintText += ' (동판신규)';
          break;
        case 'edit':
          isPrintText += ' (동판수정)';
          break;
      }
    }

    const weight =
      Number(product.thick) *
      (Number(product.length) + 5) *
      Number(product.width) /
      100 *
      0.0184 *
      Number(order.data.orderQuantity);

    return (
      <li className={listClassName} key={order._id} id={order._id}>
        <div className="order-container">
          <div className="order-deliver-remark-container">
            {order.data.deliverFast ? (
              <span className="order-list__text">
                <i className="fa fa-star" /> 지급
              </span>
            ) : (
              undefined
            )}
            {order.data.deliverDateStrict ? (
              <span className="order-list__text">
                <i className="fa fa-star" /> 납기엄수
              </span>
            ) : (
              undefined
            )}
          </div>

          <div className="order-checkbox-container">
            <Checkbox
              name={order._id}
              onInputChange={this.props.onCheckboxChange}
              disabled={order.data.isCompleted}
            />
          </div>

          <div className="order-id-container">
            <a
              className="order-list__text order-list__orderID"
              onClick={this.onOrderIDClick}
            >
              {order._id}
            </a>
          </div>

          <div className="order-dates-container">
            <p className="order-list__text">발주일: {order.data.orderedAt}</p>
            <p className="order-list__text">
              납기일: {order.data.deliverBefore}
            </p>
          </div>

          <div className={product._id + ' order-product-details-container'}>
            <div className="order-names-container">
              <a
                name={account._id}
                className="order-list__subtitle"
                onClick={this.onAccountNameClick}
              >
                {account.name}
              </a>
              <a
                name={product._id}
                className="order-list__title"
                onClick={this.onProductNameClick}
              >
                {product.name}
              </a>
            </div>
            <div className="order-product-size-container">
              <span className="order-list__text">{product.thick}</span>
              <i className="fa fa-times" />
              <span className="order-list__text">{product.length}</span>
              <i className="fa fa-times" />
              <span className="order-list__text">{product.width}</span>
            </div>
            <div className="order-product-isPrint-container">
              <p className="order-list__text">{isPrintText}</p>
            </div>
            <div className="order-orderQuantity-container">
              <p className="order-list__text">
                {comma(order.data.orderQuantity) +
                  '매 (' +
                  comma(weight.toFixed(0)) +
                  'kg)'}
              </p>
            </div>
          </div>

          <div className="order-status-select-container">
            <select
              className="select order-list__select"
              value={order.data.isCompleted ? 'completed' : order.data.status}
              onChange={this.onStatusChange}
              disabled={order.data.isCompleted}
            >
              <option value="extruding">압출중</option>
              <option value="printing" disabled={!product.isPrint}>
                인쇄중
              </option>
              <option value="cutting">가공중</option>
              <option value="completed" disabled={!order.data.isCompleted}>
                완료
              </option>
            </select>
          </div>

          {this.state.isAdmin || this.state.isManager ? (
            <div className="order-buttons-container">
              <button
                className="button button-with-icon-span order-button"
                onClick={this.onPrintOrderClick}
                disabled={order.data.isCompleted}
              >
                <i className="fa fa-print fa-lg" />
                <span>출력</span>
              </button>
              <button
                className="button button-with-icon-span order-button"
                onClick={this.onCompleteOrderClick}
                disabled={order.data.isCompleted}
              >
                <i className="fa fa-check fa-lg" />
                <span>완료</span>
              </button>
              <button
                className="button button-with-icon-span order-button"
                onClick={this.onEditClick}
                disabled={order.data.isCompleted}
              >
                <i className="fa fa-edit fa-lg" />
                <span>수정</span>
              </button>
              <button
                className="button button-with-icon-span order-button"
                onClick={this.onDeleteClick}
                disabled={order.data.isCompleted}
              >
                <i className="fa fa-trash fa-lg" />
                <span>삭제</span>
              </button>
            </div>
          ) : (
            undefined
          )}
        </div>
      </li>
    );
  }
}
