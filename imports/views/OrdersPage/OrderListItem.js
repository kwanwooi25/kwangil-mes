import React from 'react';
import moment from 'moment';

import { comma, uncomma } from '../../api/comma';
import { printOrders } from '../../api/printOrders';
import { countWeekdays } from '../../api/countWeekdays';

import Checkbox from '../../custom/Checkbox';
import AccountName from '../components/AccountName';
import ProductName from '../components/ProductName';
import OrderName from '../components/OrderName';

export default class OrderListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isSelected
  isAdmin
  isManager
  account
  product
  order
  onCheckboxChange
  updateOrderStatus
  showCompleteOrderModal
  showProductOrderModal
  showDeleteConfirmationModal
  queryObj
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager
    };

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
    const deliverBefore = moment(order.deliverBefore);
    const daysCount = countWeekdays(moment(), deliverBefore);

    let listClassName = '';
    let productSizeText = '';
    let isPrintText = '';
    let orderQuantityText = '';
    let completedQuantityText = '';

    listClassName = 'order';
    if (order.isCompleted) {
      listClassName += ' completed';
    } else if (daysCount <= 1) {
      listClassName += ' d-1';
    } else if (daysCount <= 3) {
      listClassName += ' d-3';
    }

    productSizeText = `${product.thick} x ${product.length} x ${product.width}`;

    isPrintText = '무지';
    if (product && product.isPrint) {
      isPrintText = '인쇄';
      switch (order.plateStatus) {
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

    orderQuantityText = `${comma(order.orderQuantity)}매`;
    completedQuantityText = `
      ${comma(
        order.completedQuantity ? order.completedQuantity : 0
      )}매
      `;

    // const weight =
    //   Number(product.thick) *
    //   (Number(product.length) + 5) *
    //   Number(product.width) /
    //   100 *
    //   0.0184 *
    //   Number(order.orderQuantity);

    return (
      <li className={listClassName} key={order._id} id={order._id}>
        {(this.state.isAdmin || this.state.isManager) && (
          <div className="order-checkbox-container">
            <Checkbox
              name={order._id}
              checked={this.props.isSelected}
              onInputChange={this.props.onCheckboxChange}
              disabled={order.isCompleted}
            />
          </div>
        )}

        <div className="order-container">
          <div className="order-id-container">
            {order.deliverFast && (
              <span className="order-list__text">
                <i className="fa fa-star" /> 지급
              </span>
            )}
            {order.deliverDateStrict && (
              <span className="order-list__text">
                <i className="fa fa-star" /> 납기엄수
              </span>
            )}
            {order.isDelivered && (
              <span className="order-list__text">
                [납품완료] {order.deliveredAt}
              </span>
            )}

            <OrderName className="order-list__orderID" orderID={order._id} />
          </div>

          <div className="order-dates-container">
            <p className="order-list__text">발주일: {order.orderedAt}</p>
            <p className="order-list__text">
              납기일: {order.deliverBefore}
            </p>
          </div>

          <div className="order-product-details-container">
            <div className="order-names-container">
              <AccountName
                className="order-list__accountName"
                accountID={account._id}
                accountName={account.name}
                query={this.props.queryObj.accountName}
              />
              <ProductName
                className="order-list__productName"
                productID={product._id}
                productName={product.name}
                query={this.props.queryObj.productName}
              />
            </div>
            <div className="order-product-size-container">
              <p className="order-list__text">{productSizeText}</p>
              <p className="order-list__text">{isPrintText}</p>
            </div>
            <div className="order-orderQuantity-container">
              <p className="order-list__text">{orderQuantityText} 중</p>
              <p className="order-list__text">{completedQuantityText} 완료</p>
            </div>
          </div>

          <div className="order-status-select-container">
            <select
              className="select order-list__select"
              value={order.isCompleted ? 'completed' : order.status}
              onChange={this.onStatusChange}
              disabled={order.isCompleted || !product || !account}
            >
              <option value="extruding">압출중</option>
              <option value="printing" disabled={product && !product.isPrint}>
                인쇄중
              </option>
              <option value="cutting">가공중</option>
              <option value="completed" disabled={!order.isCompleted}>
                완료
              </option>
            </select>
          </div>

          {(this.state.isAdmin || this.state.isManager) && (
            <div className="order-buttons-container">
              <button
                className="button button-with-icon-span order-button"
                onClick={this.onPrintOrderClick}
                disabled={order.isCompleted || !product || !account}
              >
                <i className="fa fa-print fa-lg" />
                <span>출력</span>
              </button>
              <button
                className="button button-with-icon-span order-button"
                onClick={this.onCompleteOrderClick}
                disabled={order.isCompleted || !product || !account}
              >
                <i className="fa fa-check fa-lg" />
                <span>완료</span>
              </button>
              <button
                className="button button-with-icon-span order-button"
                onClick={this.onEditClick}
                disabled={order.isCompleted || !product || !account}
              >
                <i className="fa fa-edit fa-lg" />
                <span>수정</span>
              </button>
              <button
                className="button button-with-icon-span order-button"
                onClick={this.onDeleteClick}
                disabled={order.isCompleted}
              >
                <i className="fa fa-trash fa-lg" />
                <span>삭제</span>
              </button>
            </div>
          )}
        </div>
      </li>
    );
  }
}
