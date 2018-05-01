import React from 'react';
import Modal from 'react-modal';
import moment from 'moment';

import { OrdersData } from '../../api/orders';
import { ProductsData } from '../../api/products';
import { AccountsData } from '../../api/accounts';
import { comma, uncomma } from '../../api/comma';

import Checkbox from '../../custom/Checkbox';
import TextInput from '../../custom/TextInput';
import DatePicker from '../../custom/DatePicker/DatePicker';
import ConfirmationModal from '../components/ConfirmationModal';

export default class CompleteOrderModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  selectedOrders
  onModalClose : function to execute on modal close
  ==========================================================================*/

  constructor(props) {
    super(props);

    let completedQuantityArray = [];
    let isCompletedArray = [];
    let completedQuantityEmptyArray = [];
    const ordersCount = props.selectedOrders.length;

    for (let i = 0; i < ordersCount; i++) {
      completedQuantityArray.push('');
      isCompletedArray.push(false);
      completedQuantityEmptyArray.push(false);
    }

    this.state = {
      completedAt: moment(),
      completedQuantityArray,
      isCompletedArray,
      completedQuantityEmptyArray,
      ordersCount,
      isConfirmationModalOpen: false,
      confirmationTitle: '',
      confirmationDescription: []
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onConfirmationModalClose = this.onConfirmationModalClose.bind(this);
  }

  validate(name, value) {
    const inputContainer = document.getElementById(name).parentNode;
    const index = Number(
      name
        .split('[')
        .pop()
        .replace(']', '')
    );
    if (!value) {
      let completedQuantityEmptyArray = this.state.completedQuantityEmptyArray;
      completedQuantityEmptyArray[index] = true;
      this.setState({ completedQuantityEmptyArray });
      inputContainer.classList.add('error');
      return false;
    } else {
      let completedQuantityEmptyArray = this.state.completedQuantityEmptyArray;
      completedQuantityEmptyArray[index] = false;
      this.setState({ completedQuantityEmptyArray });
      inputContainer.classList.remove('error');
      return true;
    }
  }

  onInputChange(e) {
    const index = Number(
      e.target.name
        .split('[')
        .pop()
        .replace(']', '')
    );
    if (e.target.type === 'checkbox') {
      let isCompletedArray = this.state.isCompletedArray;
      isCompletedArray[index] = e.target.checked;
      this.setState({ isCompletedArray });
    } else {
      let completedQuantityArray = this.state.completedQuantityArray;
      completedQuantityArray[index] = comma(uncomma(e.target.value));
      this.setState({ completedQuantityArray });
      this.validate(e.target.name, e.target.value);

      // set isCompleted: true
      // if completed quantity is larger than order quantity
      const order = OrdersData.findOne({
        _id: this.props.selectedOrders[index]
      });
      const orderQuantity = Number(order.data.orderQuantity);

      if (Number(uncomma(e.target.value)) >= orderQuantity) {
        let isCompletedArray = this.state.isCompletedArray;
        isCompletedArray[index] = true;
        this.setState({ isCompletedArray });
      } else {
        let isCompletedArray = this.state.isCompletedArray;
        isCompletedArray[index] = false;
        this.setState({ isCompletedArray });
      }
    }
  }

  onClickOK() {
    let confirmationDescription = [
      `${this.state.ordersCount}건 작업 완료 하시겠습니까?`
    ];
    let isValidated = false;

    for (let i = 0; i < this.state.ordersCount; i++) {
      const targetName = `completedQuantityArray[${i}]`;
      const value = this.state.completedQuantityArray[i];
      const order = OrdersData.findOne({ _id: this.props.selectedOrders[i] });
      const product = ProductsData.findOne({ _id: order.data.productID });
      const orderInfoText = `
        ${product.name} (${product.thick}x${product.length}x${product.width})
        = ${comma(uncomma(this.state.completedQuantityArray[i]))}매 ${
        this.state.isCompletedArray[i] ? '(완료)' : ''
      }
      `;
      confirmationDescription.push(orderInfoText);
      if (!this.validate(targetName, value)) {
        document.getElementById(targetName).focus();
        isValidated = false;
        break;
      } else {
        isValidated = true;
      }
    }

    if (isValidated) {
      this.setState({
        isConfirmationModalOpen: true,
        confirmationTitle: '작업 완료 등록',
        confirmationDescription
      });
    }
  }

  onConfirmationModalClose(answer) {
    this.setState({
      isConfirmationModalOpen: false,
      confirmationTitle: '',
      confirmationDescription: []
    });
    if (answer) {
      const lis = document.querySelectorAll(
        'li.complete-order-modal__list-item'
      );
      for (let i = 0; i < lis.length; i++) {
        const order = OrdersData.findOne({ _id: lis[i].id });
        order.data.completedAt = this.state.completedAt.format('YYYY-MM-DD');
        order.data.completedQuantity = Number(
          uncomma(this.state.completedQuantityArray[i])
        );
        order.data.isCompleted = this.state.isCompletedArray[i];
        if (this.state.isCompletedArray[i]) {
          order.data.status = 'completed';
        }

        Meteor.call('orders.update', order._id, order.data, (err, res) => {
          if (!err) {
            this.props.onModalClose(true);
          }
        });
      }
    }
  }

  getOrderList(selectedOrders) {
    return selectedOrders.map((orderID, index) => {
      const order = OrdersData.findOne({ _id: orderID });
      const product = ProductsData.findOne({ _id: order.data.productID });
      const account = AccountsData.findOne({ _id: product.accountID });

      const productSizeText = `${product.thick} x ${product.length} x ${
        product.width
      }`;

      return (
        <li
          className="complete-order-modal__list-item"
          id={orderID}
          key={orderID}
        >
          <div className="complete-order-modal__order-details-container">
            <div className="complete-order-modal__names-container">
              <p className="complete-order-modal__accountName">
                {account.name}
              </p>
              <p className="complete-order-modal__productName">
                {product.name}
              </p>
            </div>
            <div className="complete-order-modal__size-container">
              <p className="complete-order-modal__productSize">
                {productSizeText}
              </p>
              <p className="complete-order-modal__orderQuantity">
                주문수량: {comma(order.data.orderQuantity)}매
              </p>
            </div>
          </div>
          <div className="complete-order-modal__inputs-container">
            <div className="complete-order-modal__input-container">
              <label
                className="complete-order-modal__label"
                htmlFor={`completedQuantityArray[${index}]`}
              >
                완성수량
              </label>
              <TextInput
                className="form-element complete-order-modal__input"
                inputType="text"
                id={`completedQuantityArray[${index}]`}
                value={this.state.completedQuantityArray[index]}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.completedQuantityEmptyArray[index] &&
                  '완성수량을 입력하세요.'
                }
              />
            </div>
            <div className="complete-order-modal__input-container">
              <label className="complete-order-modal__label" />
              <Checkbox
                name={`isCompletedArray[${index}]`}
                label="작업완료"
                checked={this.state.isCompletedArray[index]}
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
          document.getElementById('completedQuantityArray[0]').focus();
        }}
        onRequestClose={() => {
          this.props.onModalClose(false);
        }}
        ariaHideApp={false}
        className="boxed-view__box complete-order-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h2>작업 완료</h2>
        </div>
        <div className="boxed-view__content">
          <ul id="order-list-to-complete">
            {this.getOrderList(this.props.selectedOrders)}
          </ul>

          <div className="complete-order-modal__completedAt-container">
            <label
              className="complete-order-modal__label"
              htmlFor="completedAt"
            >
              완료일
            </label>
            <DatePicker
              id="completedAt"
              date={this.state.completedAt}
              onDateChange={completedAt => {
                if (completedAt === null) completedAt = moment();
                this.setState({ completedAt });
              }}
              isOutsideRange={() => {
                return false;
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
