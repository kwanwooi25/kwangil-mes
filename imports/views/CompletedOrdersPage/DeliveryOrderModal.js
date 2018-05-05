import React from 'react';
import Modal from 'react-modal';
import moment from 'moment';

import { OrdersData } from '../../api/orders';
import { ProductsData } from '../../api/products';
import { DeliveryData } from '../../api/delivery';
import { AccountsData } from '../../api/accounts';
import { comma, uncomma } from '../../api/comma';
import { avoidWeekend } from '../../api/avoidWeekend';

import Checkbox from '../../custom/Checkbox';
import TextInput from '../../custom/TextInput';
import DatePicker from '../../custom/DatePicker/DatePicker';
import ConfirmationModal from '../components/ConfirmationModal';

export default class DeliveryOrderModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  selectedOrders
  onModalClose : function to execute on modal close
  ==========================================================================*/

  constructor(props) {
    super(props);

    let deliverByArray = [];
    let deliverBySelectArray = [];
    let deliverByEmptyArray = [];
    const ordersCount = props.selectedOrders.length;

    for (let i = 0; i < ordersCount; i++) {
      deliverByArray.push('');
      deliverBySelectArray.push('direct');
      deliverByEmptyArray.push(false);
    }

    this.state = {
      deliverAt: avoidWeekend(moment()),
      deliverByArray,
      deliverBySelectArray,
      deliverByEmptyArray,
      ordersCount,
      isConfirmationModalOpen: false,
      confirmationTitle: '',
      confirmationDescription: []
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onConfirmationModalClose = this.onConfirmationModalClose.bind(this);
  }

  onInputChange(e) {
    const index = Number(
      e.target.name
        .split('[')
        .pop()
        .replace(']', '')
    );
    const targetName = e.target.name.split('[').shift();

    if (targetName === 'deliverBySelectArray') {
      let deliverBySelectArray = this.state.deliverBySelectArray;
      deliverBySelectArray[index] = e.target.value;
      this.setState({ deliverBySelectArray });
    } else if (targetName === 'deliverByArray') {
      let deliverByArray = this.state.deliverByArray;
      deliverByArray[index] = e.target.value;
      this.setState({ deliverByArray });
    }
  }

  onClickOK() {
    let confirmationDescription = [
      `${this.state.ordersCount}건 출고지시 하시겠습니까?`
    ];

    for (let i = 0; i < this.state.ordersCount; i++) {
      const targetName = `deliverByArray[${i}]`;
      const value = this.state.deliverByArray[i];
      const order = OrdersData.findOne({ _id: this.props.selectedOrders[i] });
      const product = ProductsData.findOne({ _id: order.data.productID });
      const orderInfoText = `
        ${product.name} (${product.thick}x${product.length}x${product.width}) = ${comma(uncomma(order.data.completedQuantity))}매`;
      confirmationDescription.push(orderInfoText);
    }

    this.setState({
      isConfirmationModalOpen: true,
      confirmationTitle: '출고 지시 등록',
      confirmationDescription
    });
  }

  onConfirmationModalClose(answer) {
    this.setState({
      isConfirmationModalOpen: false,
      confirmationTitle: '',
      confirmationDescription: []
    });

    if (answer) {
      const lis = document.querySelectorAll(
        'li.delivery-order-modal__list-item'
      );

      const deliveryDate = this.state.deliverAt.format('YYYY-MM-DD');
      const isDeliveryDateExist = !!DeliveryData.findOne({ _id: deliveryDate });
      let orderListToAdd = [];

      for (let i = 0; i < lis.length; i++) {
        const order = OrdersData.findOne({ _id: lis[i].id });
        order.data.deliveredAt = deliveryDate;

        let deliverBy = '';
        if (this.state.deliverBySelectArray[i] === 'etc') {
          deliverBy = this.state.deliverByArray[i];
        } else {
          deliverBy = this.state.deliverBySelectArray[i];
        }

        const orderToDeliver = { orderID: order._id, deliverBy };
        orderListToAdd.push(orderToDeliver);

        Meteor.call('orders.update', order._id, order.data, (err, res) => {});
      }

      if (!isDeliveryDateExist) {
        let orderList = orderListToAdd;
        Meteor.call('delivery.insert', deliveryDate, orderList, (err, res) => {});
        this.props.onModalClose(true);
      } else {
        let orderList = DeliveryData.findOne({ _id: deliveryDate }).orderList;
        orderList = orderList.concat(orderListToAdd);
        Meteor.call('delivery.update', deliveryDate, orderList, (err, res) => {});
        this.props.onModalClose(true);
      }
    }
  }

  getDeliveryList(selectedOrders) {
    return selectedOrders.map((orderID, index) => {
      const order = OrdersData.findOne({ _id: orderID });
      const product = ProductsData.findOne({ _id: order.data.productID });
      const account = AccountsData.findOne({ _id: product.accountID });

      const productSizeText = `${product.thick} x ${product.length} x ${
        product.width
      }`;

      return (
        <li
          className="delivery-order-modal__list-item"
          id={orderID}
          key={orderID}
        >
          <div className="delivery-order-modal__order-details-container">
            <div className="delivery-order-modal__names-container">
              <p className="delivery-order-modal__accountName">
                {account.name}
              </p>
              <p className="delivery-order-modal__productName">
                {product.name}
              </p>
            </div>
            <div className="delivery-order-modal__size-container">
              <p className="delivery-order-modal__productSize">
                {productSizeText}
              </p>
              <p className="delivery-order-modal__orderQuantity">
                완료수량: {comma(order.data.completedQuantity)}매
              </p>
            </div>
          </div>
          <div className="delivery-order-modal__inputs-container">
            <div className="delivery-order-modal__input-container">
              <label
                className="delivery-order-modal__label"
                htmlFor={`deliverBySelectArray[${index}]`}
              >
                출고방법
              </label>
              <select
                className="select delivery-order-modal__select"
                id={`deliverBySelectArray[${index}]`}
                name={`deliverBySelectArray[${index}]`}
                value={this.state.deliverBySelectArray[index]}
                onChange={this.onInputChange}
              >
                <option value="direct">직납</option>
                <option value="post">택배</option>
                <option value="etc">기타</option>
              </select>
            </div>
            <div className="delivery-order-modal__input-container">
              <label className="delivery-order-modal__label" />
              <TextInput
                className="form-element delivery-order-modal__input"
                inputType="text"
                id={`deliverByArray[${index}]`}
                value={this.state.deliverByArray[index]}
                disabled={this.state.deliverBySelectArray[index] !== 'etc'}
                onInputChange={this.onInputChange}
              />
            </div>
          </div>
        </li>
      );
    });
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onAfterOpen={() => {
          document.getElementById('deliverBySelectArray[0]').focus();
        }}
        onRequestClose={() => {
          this.props.onModalClose(false);
        }}
        ariaHideApp={false}
        className="boxed-view__box delivery-order-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h2>출고 등록</h2>
        </div>
        <div className="boxed-view__content">
          <ul id="order-list-to-deliver">
            {this.getDeliveryList(this.props.selectedOrders)}
          </ul>
          <div className="delivery-order-modal__deliverAt-container">
            <label
              className="delivery-order-modal__label"
              htmlFor="deliverAt"
            >
              출고일
            </label>
            <DatePicker
              id="deliverAt"
              date={this.state.deliverAt}
              onDateChange={deliverAt => {
                if (deliverAt === null) deliverAt = moment();
                this.setState({ deliverAt });
              }}
              withPortal={true}
            />
          </div>
          <div className="confirmation-modal__button-group">
            <button className="button" onClick={this.onClickOK}>
              확인
            </button>
            <button
              className="button button-cancel"
              onClick={() => {
                this.props.onModalClose(false);
              }}
            >
              취소
            </button>
          </div>
        </div>
        {this.state.isConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title={this.state.confirmationTitle}
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.onConfirmationModalClose}
          />
        )}
      </Modal>
    );
  }
}
