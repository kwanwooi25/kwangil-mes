import React from 'react';
import Modal from 'react-modal';
import moment from 'moment';

import { OrdersData } from '../../api/orders';
import { ProductsData } from '../../api/products';
import { DeliveryData } from '../../api/delivery';
import { comma, uncomma } from '../../api/comma';

import Checkbox from '../../custom/Checkbox';
import TextInput from '../../custom/TextInput';
import DatePicker from '../../custom/DatePicker/DatePicker';
import ConfirmationModal from '../components/ConfirmationModal';

export default class DeliveryOrderModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  orderID
  onModalClose : function to execute on modal close
  ==========================================================================*/

  constructor(props) {
    super(props);

    this.state = {
      deliverAt: moment(),
      deliverBySelect: 'direct',
      deliverBy: '',
      deliverByEmpty: false,
      isConfirmationModalOpen: false,
      confirmationDescription: []
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.hideConfirmationModal = this.hideConfirmationModal.bind(this);
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
    this.setState({
      [e.target.name]: e.target.value,
      deliverByEmpty: false
    });
    if (e.target.name === 'deliverBy' && this.state.deliverBySelect === 'etc') {
      this.validate(e.target.name, e.target.value);
    }
  }

  onClickOK(e) {
    e.preventDefault();
    let validated = true;
    if (this.state.deliverBySelect === 'etc') {
      validated = this.validate('deliverBy', this.state.deliverBy);
    }

    if (validated) {
      const order = OrdersData.findOne({ _id: this.props.orderID });
      const product = ProductsData.findOne({ _id: order.data.productID });

      let confirmationDescription = ['출고지시 하시겠습니까?'];
      const orderInfoText = `
        ${product.name} (${product.thick}x${product.length}x${product.width})
        = ${comma(uncomma(order.data.completedQuantity))}매`;
      confirmationDescription.push(orderInfoText);

      this.setState({ isConfirmationModalOpen: true, confirmationDescription });
    } else {
      document.getElementById('deliverBy').focus();
    }
  }

  hideConfirmationModal(answer) {
    this.setState({ isConfirmationModalOpen: false });

    if (answer) {
      const deliveryDate = this.state.deliverAt.format('YYYY-MM-DD');
      const isDeliveryDateExist = !!DeliveryData.findOne({ _id: deliveryDate });
      let deliverBy = '';
      if (this.state.deliverBySelect === 'etc') {
        deliverBy = this.state.deliverBy;
      } else {
        deliverBy = this.state.deliverBySelect;
      }
      const orderToDeliver = { orderID: this.props.orderID, deliverBy };
      let orderList = [];

      console.log(DeliveryData.findOne({ _id: deliveryDate }));

      if (!isDeliveryDateExist) {
        orderList = [ orderToDeliver ];
        Meteor.call('delivery.insert', deliveryDate, orderList, (err, res) => {
          if (!err) {
            this.props.onModalClose();
          }
        });
      } else {
        orderList = DeliveryData.findOne({ _id: deliveryDate }).data;
        orderList.push(orderToDeliver);
        console.log(orderList);
        // Meteor.call('delivery.update', deliveryDate, orderList, (err, res) => {
        //   if (!err) {
        //     this.props.onModalClose();
        //   }
        // })
      }
    }
  }

  render() {
    const order = OrdersData.findOne({ _id: this.props.orderID });
    const product = ProductsData.findOne({ _id: order.data.productID });

    const productSizeText = `${product.thick} x ${product.length} x ${product.width}`;

    return (
      <Modal
        isOpen={this.props.isOpen}
        onAfterOpen={() => {
          document.getElementById('deliverAt').focus();
        }}
        onRequestClose={() => {
          this.props.onModalClose();
        }}
        ariaHideApp={false}
        className="boxed-view__box delivery-order-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h2>출고 작성</h2>
        </div>
        <div className="boxed-view__content">
          <div className="delivery-order-modal__order-details-container">
            <p className="delivery-order-modal__accountName">
              {product.accountName}
            </p>
            <p className="delivery-order-modal__productName">{product.name}</p>
            <p className="delivery-order-modal__productSize">
              {productSizeText}
            </p>
            <p className="delivery-order-modal__orderQuantity">
              완성수량: {comma(order.data.completedQuantity)}매
            </p>
          </div>
          <form className="delivery-order-modal__form">
            <div className="delivery-order-modal__input-container">
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
              />
            </div>
            <div className="delivery-order-modal__input-container">
              <label
                className="delivery-order-modal__label"
                htmlFor="deliverBySelect"
              >
                출고방법
              </label>
              <select
                className="select delivery-order-modal__select"
                name="deliverBySelect"
                value={this.state.deliverBySelect}
                onChange={this.onInputChange}
              >
                <option value="direct">직납</option>
                <option value="post">택배</option>
                <option value="etc">기타</option>
              </select>
              <TextInput
                className="form-element delivery-order-modal__input"
                inputType="text"
                id="deliverBy"
                value={this.state.deliverBy}
                disabled={this.state.deliverBySelect !== 'etc'}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.deliverByEmpty ?
                  '납품방법을 입력하세요.' :
                  undefined
                }
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

        {this.state.isConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title="작업 완료"
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideConfirmationModal}
          />
        ) : (
          undefined
        )}
      </Modal>
    );
  }
}
