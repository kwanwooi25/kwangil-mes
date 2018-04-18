import React from 'react';
import Modal from 'react-modal';
import moment from 'moment';

import { OrdersData } from '../../api/orders';
import { ProductsData } from '../../api/products';

import Checkbox from '../../custom/Checkbox';
import TextInput from '../../custom/TextInput';
import DatePicker from '../../custom/DatePicker/DatePicker';

export default class CompleteOrderMultiModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  selectedOrders
  onModalClose : function to execute on modal close
  ==========================================================================*/

  constructor(props) {
    super(props);

    let completedAtArray = [];
    let completedQuantityArray = [];
    let isCompletedArray = [];
    let completedQuantityEmptyArray = [];

    for (let i = 0; i < props.selectedOrders.length; i++) {
      completedAtArray.push(moment());
      completedQuantityArray.push('');
      isCompletedArray.push(false);
      completedQuantityEmptyArray.push(false);
    }

    this.state = {
      completedAtArray,
      completedQuantityArray,
      isCompletedArray,
      completedQuantityEmptyArray
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
    // const inputContainer = document.getElementById(name).parentNode;
    //
    // if (!value) {
    //   this.setState({ [`${name}Empty`]: true });
    //   inputContainer.classList.add('error');
    //   return false;
    // } else {
    //   this.setState({ [`${name}Empty`]: false });
    //   inputContainer.classList.remove('error');
    //   return true;
    // }
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
      completedQuantityArray[index] = this.comma(this.uncomma(e.target.value));
      this.setState({ completedQuantityArray });
      // this.validate('completedQuantityArray', e.target.value);
    }
  }

  onClickOK(e) {
    // e.preventDefault();
    // if (this.validate('completedQuantity', this.state.completedQuantity)) {
    //   let order = OrdersData.findOne({ _id: this.props.orderID });
    //   order.data.completedAt = this.state.completedAt.format('YYYY-MM-DD');
    //   order.data.completedQuantity = this.uncomma(this.state.completedQuantity);
    //   order.data.isCompleted = this.state.isCompleted;
    //
    //   Meteor.call('orders.update', order._id, order.data, (err, res) => {
    //     if (!err) {
    //       this.props.onModalClose();
    //     } else {
    //       this.setState({ error: err.error });
    //     }
    //   });
    // } else {
    //   document.getElementById('completedQuantity').focus();
    // }
  }

  getOrderList(selectedOrders) {
    return selectedOrders.map((orderID, index) => {
      const order = OrdersData.findOne({ _id: orderID });
      const product = ProductsData.findOne({ _id: order.data.productID });

      const productSizeText = `
        ${product.thick} x
        ${product.length} x
        ${product.width}
      `;

      // console.log(index, order, product);

      return (
        <li id={orderID} key={orderID}>
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
          <div className="complete-order-modal__input-container">
            <label
              className="complete-order-modal__label"
              htmlFor={`completedAtArray[${index}]`}
            >
              완료일
            </label>
            <DatePicker
              id={`completedAtArray[${index}]`}
              date={this.state.completedAtArray[index]}
              onDateChange={completedAt => {
                if (completedAt === null) completedAt = moment();
                let completedAtArray = this.state.completedAtArray;
                completedAtArray[index] = completedAt;
                this.setState({ completedAtArray });
              }}
              isOutsideRange={() => {
                return false;
              }}
            />
          </div>
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
                this.state.completedQuantityEmptyArray[index]
                  ? '완성수량을 입력하세요.'
                  : undefined
              }
            />
            <Checkbox
              name={`isCompletedArray[${index}]`}
              label="작업완료"
              checked={this.state.isCompletedArray[index]}
              onInputChange={this.onInputChange}
            />
          </div>
        </li>
      );
    });
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={() => {
          this.props.onModalClose();
        }}
        ariaHideApp={false}
        className="boxed-view__box complete-order-multi-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h2>작업 완료</h2>
        </div>
        <div className="boxed-view__content">
          <ul id="order-list-to-complete">
            {this.getOrderList(this.props.selectedOrders)}
          </ul>
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
        </div>
      </Modal>
    );
  }
}
