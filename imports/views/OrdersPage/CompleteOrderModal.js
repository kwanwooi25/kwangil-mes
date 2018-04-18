import React from 'react';
import Modal from 'react-modal';
import moment from 'moment';

import { OrdersData } from '../../api/orders';
import { ProductsData } from '../../api/products';

import Checkbox from '../../custom/Checkbox';
import TextInput from '../../custom/TextInput';
import DatePicker from '../../custom/DatePicker/DatePicker';

export default class CompleteOrderModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  orderID
  onModalClose : function to execute on modal close
  ==========================================================================*/

  constructor(props) {
    super(props);

    this.state = {
      completedAt: moment(),
      completedQuantity: '',
      isCompleted: false,
      completedQuantityEmpty: false
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
  }

  comma(str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
  }

  uncomma(str) {
    str = String(str);
    return str.replace(/[^\d]+/g, '');
  }

  validate(name, value) {
    const inputContainer = document.getElementById(name).parentNode;

    if (!value) {
      this.setState({ [`${name}Empty`]: true });
      inputContainer.classList.add('error');
      return false;
    } else {
      this.setState({ [`${name}Empty`]: false });
      inputContainer.classList.remove('error');
      return true;
    }
  }

  onInputChange(e) {
    if (e.target.type === 'checkbox') {
      this.setState({
        [e.target.name]: e.target.checked
      });
    } else {
      this.setState({
        [e.target.name]: this.comma(this.uncomma(e.target.value))
      });
      this.validate(e.target.name, e.target.value);
    }
  }

  onClickOK(e) {
    e.preventDefault();
    if (this.validate('completedQuantity', this.state.completedQuantity)) {
      let order = OrdersData.findOne({ _id: this.props.orderID });
      order.data.completedAt = this.state.completedAt.format('YYYY-MM-DD');
      order.data.completedQuantity = this.uncomma(this.state.completedQuantity);
      order.data.isCompleted = this.state.isCompleted;

      Meteor.call('orders.update', order._id, order.data, (err, res) => {
        if (!err) {
          this.props.onModalClose();
        } else {
          this.setState({ error: err.error });
        }
      });
    } else {
      document.getElementById('completedQuantity').focus();
    }
  }

  render() {
    const order = OrdersData.findOne({ _id: this.props.orderID });
    const product = ProductsData.findOne({ _id: order.data.productID });

    const productSizeText = `
      ${product.thick} x
      ${product.length} x
      ${product.width}
    `;
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={() => {
          this.props.onModalClose();
        }}
        ariaHideApp={false}
        className="boxed-view__box complete-order-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h2>작업 완료</h2>
        </div>
        <div className="boxed-view__content">
          <div className="complete-order-modal__order-details-container">
            <p className="complete-order-modal__accountName">
              {product.accountName}
            </p>
            <p className="complete-order-modal__productName">{product.name}</p>
            <p className="complete-order-modal__productSize">
              {productSizeText}
            </p>
            <p className="complete-order-modal__orderQuantity">
              주문수량: {this.comma(order.data.orderQuantity)}매
            </p>
          </div>
          <form className="complete-order-modal__form">
            <div className="complete-order-modal__input-container">
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
              />
            </div>
            <div className="complete-order-modal__input-container">
              <label
                className="complete-order-modal__label"
                htmlFor="completedQuantity"
              >
                완성수량
              </label>
              <TextInput
                className="form-element complete-order-modal__input"
                inputType="text"
                id="completedQuantity"
                value={this.state.completedQuantity}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.completedQuantityEmpty
                    ? '완성수량을 입력하세요.'
                    : undefined
                }
              />
              <Checkbox
                name="isCompleted"
                label="작업완료"
                checked={this.state.isCompleted}
                onInputChange={this.onInputChange}
              />
            </div>
            <div className="confirmation-modal__button-group">
              <button className="button" onClick={this.onClickOK}>
                확인
              </button>
              <button
                className="button button-cancel"
                onClick={e => {
                  e.preventDefault();
                  this.props.onModalClose();
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </Modal>
    );
  }
}
