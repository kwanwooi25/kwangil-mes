import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';
import moment from 'moment';

import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';
import { comma, uncomma } from '../../api/comma';

import DatePickerWithMessage from '../../custom/DatePicker/DatePickerWithMessage';
import TextInput from '../../custom/TextInput';
import Textarea from '../../custom/Textarea';
import RadioButton from '../../custom/RadioButton';
import Checkbox from '../../custom/Checkbox';
import Accordion from '../../custom/Accordion';
import ConfirmationModal from '../components/ConfirmationModal';

import noImage from '../../assets/no-image.png';

export default class ProductOrderModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  productID
  orderID
  onModalClose : function to execute on modal close
  isAdmin
  isManager
  ==========================================================================*/
  constructor(props) {
    super(props);

    if (props.orderID) {
      // EDIT mode
      const order = OrdersData.findOne({ _id: props.orderID });
      const product = ProductsData.findOne({ _id: order.data.productID });

      initialState = {
        mode: 'EDIT',
        orderID: props.orderID,
        product,
        orderedAt: moment(order.data.orderedAt),
        deliverBefore: moment(order.data.deliverBefore),
        orderQuantity: comma(order.data.orderQuantity),
        deliverDateStrict: order.data.deliverDateStrict,
        deliverFast: order.data.deliverFast,
        plateStatus: order.data.plateStatus, // "confirm" : 확인, "new" : 신규, "edit" : 수정
        workMemo: order.data.workMemo,
        deliverMemo: order.data.deliverMemo,
        status: order.data.status, // 작업지시 직후: 압출중, --> 'printing' --> 'cutting'
        isCompleted: false,
        isDelivered: false,
        completedQuantity: '',
        completedAt: '',
        deliveredAt: '',
        orderedAtEmpty: false,
        deliverBeforeEmpty: false,
        orderQuantityEmpty: false,
        isConfirmationModalOpen: false,
        confirmationTitle: '',
        confirmationDescription: []
      };
    } else {
      // ADDNEW mode
      const product = ProductsData.findOne({ _id: props.productID });
      initialState = {
        mode: 'ADDNEW',
        orderID: '',
        product,
        orderedAt: moment(),
        deliverBefore: moment(),
        orderQuantity: '',
        deliverDateStrict: false,
        deliverFast: false,
        plateStatus: 'confirm', // "confirm" : 확인, "new" : 신규, "edit" : 수정
        workMemo: '',
        deliverMemo: '',
        status: 'extruding',
        isCompleted: false,
        isDelivered: false,
        completedQuantity: '',
        completedAt: '',
        deliveredAt: '',
        orderedAtEmpty: false,
        deliverBeforeEmpty: false,
        orderQuantityEmpty: false,
        isConfirmationModalOpen: false,
        confirmationTitle: '',
        confirmationDescription: []
      };
    }

    this.state = initialState;

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onConfirmationModalClose = this.onConfirmationModalClose.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
  }

  componentDidMount() {
    this.setDeliverBefore(moment());
  }

  setDeliverBefore(orderedAt) {
    let leadtime = 7;
    if (this.state.product.isPrint) {
      leadtime = 10;
    }
    const deliverBefore = this.avoidWeekend(orderedAt.add(leadtime, 'days'));
    this.setState({ deliverBefore });
  }

  // function to set deliverBefore date to be weekdays
  // passes moment() object
  avoidWeekend(date) {
    if (date.day() === 6) {
      date = date.subtract(1, 'days');
    } else if (date.day() === 7) {
      date = date.add(1, 'days');
    }
    return date;
  }

  getProductInfo() {
    const product = this.state.product;
    const sizeText = `
      ${product.thick} x ${product.length} x ${product.width}
    `;

    let extPrintText = `${product.extColor}원단`;
    let printDetailText = '';
    if (product.isPrint) {
      extPrintText += ` / 인쇄 ${Number(product.printFrontColorCount) +
        Number(product.printBackColorCount)}도`;
      printDetailText = `(전면 ${product.printFrontColorCount}도: ${
        product.printFrontColor
      }`;
      if (product.printBackColorCount) {
        printDetailText += `, 후면 ${product.printBackColorCount}도: ${
          product.printBackColor
        })`;
      } else {
        printDetailText += ')';
      }
    } else {
      extPrintText += ` / 무지`;
    }

    let cutDetailText = '';
    if (product.cutUltrasonic) {
      cutDetailText = '초음파가공';
      if (product.cutPowderPack) {
        cutDetailText += ' / 가루포장';
      }
      if (product.cutPunches) {
        cutDetailText += ` / 바람구멍 (${product.cutPunchCount}개)`;
      }
    } else if (product.cutPowderPack) {
      cutDetailText = '가루포장';
      if (product.cutPunches) {
        cutDetailText += ` / 바람구멍 (${product.cutPunchCount}개)`;
      }
    } else if (product.cutPunches) {
      cutDetailText = `바람구멍 (${product.cutPunchCount}개)`;
    }

    let packDetailText = `${product.packMaterial}포장`;
    if (product.packQuantity) {
      packDetailText += ` (${comma(product.packQuantity)}매씩)`;
    }
    if (product.packDeliverAll) {
      packDetailText += ' / 전량납품';
    }

    return (
      <div className="product-order-modal__product-info-container">
        <p className="product-order-modal__accountName">
          {product.accountName}
        </p>
        <p className="product-order-modal__productName">{product.name}</p>
        <p className="product-order-modal__description">{sizeText}</p>
        <p className="product-order-modal__description">{extPrintText}</p>
        {printDetailText && (
          <p className="product-order-modal__description">{printDetailText}</p>
        )}
        {cutDetailText && (
          <p className="product-order-modal__description">{cutDetailText}</p>
        )}
        {packDetailText && (
          <p className="product-order-modal__description">{packDetailText}</p>
        )}
        {product.isPrint && (
          <img
            className="product-order-modal__print-image"
            src={product.printImageURL || noImage}
          />
        )}
      </div>
    );
  }

  onInputChange(e) {
    // add and remove class 'changed' on EDIT mode
    if (
      this.state.mode === 'EDIT' &&
      initialState[e.target.name] !== e.target.value
    ) {
      e.target.parentNode.classList.add('changed');
    } else {
      e.target.parentNode.classList.remove('changed');
    }

    if (e.target.name === 'orderQuantity') {
      this.setState({
        [e.target.name]: comma(uncomma(e.target.value))
      });
    } else if (e.target.type === 'checkbox') {
      this.setState({ [e.target.name]: e.target.checked });
    } else {
      this.setState({ [e.target.name]: e.target.value });
    }

    // check validation
    if (
      e.target.type !== 'checkbox' &&
      e.target.type !== 'radio' &&
      e.target.type !== 'textarea'
    ) {
      this.validate(e.target.name, e.target.value);
    }
  }

  validate(name, value) {
    const inputContainer = document.getElementById(name).parentNode;

    // check if the value empty
    if (value === '' || value === null) {
      this.setState({ [`${name}Empty`]: true });
      inputContainer.classList.add('error');
      return false;
    } else {
      this.setState({ [`${name}Empty`]: false });
      inputContainer.classList.remove('error');
      return true;
    }
  }

  onClickOK(e) {
    e.preventDefault();

    // validation
    if (!this.validate('orderedAt', this.state.orderedAt)) {
      document.getElementById('orderedAt').focus();
    } else if (!this.validate('deliverBefore', this.state.deliverBefore)) {
      document.getElementById('deliverBefore').focus();
    } else if (!this.validate('orderQuantity', this.state.orderQuantity)) {
      document.getElementById('orderQuantity').focus();
    } else {
      if (this.state.mode === 'ADDNEW') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '신규 작업지시',
          confirmationDescription: [
            this.state.product.name,
            `  ${this.state.product.thick} x
              ${this.state.product.length} x
              ${this.state.product.width} = ${comma(
              this.state.orderQuantity
            )}매`,
            '작업지시 하시겠습니까?'
          ]
        });
      } else if (this.state.mode === 'EDIT') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '수정 작업지시',
          confirmationDescription: [
            this.state.product.name,
            `  ${this.state.product.thick} x
              ${this.state.product.length} x
              ${this.state.product.width} = ${comma(
              this.state.orderQuantity
            )}매`,
            '작업지시 수정하시겠습니까?'
          ]
        });
      }
    }
  }

  onConfirmationModalClose(answer) {
    this.setState({ isConfirmationModalOpen: false });

    if (answer && this.state.mode === 'ADDNEW') {
      const orderData = {
        productID: this.state.product._id,
        orderedAt: this.state.orderedAt.format('YYYY-MM-DD'),
        deliverBefore: this.state.deliverBefore.format('YYYY-MM-DD'),
        orderQuantity: Number(uncomma(this.state.orderQuantity)),
        deliverDateStrict: this.state.deliverDateStrict,
        deliverFast: this.state.deliverFast,
        plateStatus: this.state.product.isPrint ? this.state.plateStatus : '',
        workMemo: this.state.workMemo,
        deliverMemo: this.state.deliverMemo,
        status: 'extruding', // 작업지시 직후: 압출중, --> 'printing' --> 'cutting'
        isCompleted: false,
        isDelivered: false,
        completedQuantity: '',
        completedAt: '',
        deliveredAt: ''
      };

      Meteor.call('orders.insert', orderData, (err, res) => {
        if (!err) {
          this.props.onModalClose();
        } else {
          this.setState({ error: err.error });
        }
      });
    } else if (answer && this.state.mode === 'EDIT') {
      const orderData = {
        productID: this.state.product._id,
        orderedAt: this.state.orderedAt.format('YYYY-MM-DD'),
        deliverBefore: this.state.deliverBefore.format('YYYY-MM-DD'),
        orderQuantity: uncomma(this.state.orderQuantity),
        deliverDateStrict: this.state.deliverDateStrict,
        deliverFast: this.state.deliverFast,
        plateStatus: this.state.plateStatus,
        workMemo: this.state.workMemo,
        deliverMemo: this.state.deliverMemo,
        status: this.state.status, // 작업지시 직후: 압출중, --> 'printing' --> 'cutting'
        isCompleted: false,
        isDelivered: false,
        completedQuantity: '',
        completedAt: '',
        deliveredAt: ''
      };

      Meteor.call(
        'orders.update',
        this.state.orderID,
        orderData,
        (err, res) => {
          if (!err) {
            this.props.onModalClose();
          } else {
            this.setState({ error: err.error });
          }
        }
      );
    }
  }

  onClickCancel(e) {
    e.preventDefault();
    this.props.onModalClose();
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onAfterOpen={() => {
          document.getElementById('orderQuantity').focus();
        }}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box product-order-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>
            {this.state.mode === 'ADDNEW'
              ? '작업지시 작성'
              : this.state.mode === 'EDIT' && '작업지시 수정'}
          </h1>
        </div>
        <form className="boxed-view__content product-order-modal__content">
          <div className="accordion-container product-order-modal__accordion">
            <Accordion title="제품정보" />
            <div className="accordion-panel open">{this.getProductInfo()}</div>
          </div>

          <div className="accordion-container product-order-modal__accordion">
            <Accordion title="작업지시 내용" />
            <div className="accordion-panel open">
              <div className="form-element-group">
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label htmlFor="orderedAt">발주일</label>
                  </div>
                  <div className="form-elements">
                    <DatePickerWithMessage
                      id="orderedAt"
                      date={this.state.orderedAt}
                      onDateChange={orderedAt => {
                        this.setState({ orderedAt });
                      }}
                      isOutsideRange={() => {
                        return false;
                      }}
                      disabled={this.state.mode === 'EDIT'}
                      errorMessage={
                        this.state.orderedAtEmpty
                        && '발주일을 입력하세요.'
                      }
                    />
                  </div>
                </div>
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label htmlFor="deliverBefore">납기일</label>
                  </div>
                  <div className="form-elements">
                    <DatePickerWithMessage
                      id="deliverBefore"
                      date={this.state.deliverBefore}
                      onDateChange={deliverBefore => {
                        this.setState({ deliverBefore });
                      }}
                      errorMessage={
                        this.state.deliverBeforeEmpty
                        && '납기일을 입력하세요.'
                      }
                    />
                  </div>
                </div>
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label htmlFor="orderQuantity">발주수량</label>
                  </div>
                  <div className="form-elements">
                    <TextInput
                      className="form-element"
                      inputType="text"
                      id="orderQuantity"
                      value={this.state.orderQuantity}
                      onInputChange={this.onInputChange}
                      errorMessage={
                        this.state.orderQuantityEmpty
                        && '발주수량을 입력하세요.'
                      }
                    />
                  </div>
                </div>

                <div className="form-element-container">
                  <div className="form-element__label">
                    <label />
                  </div>
                  <div className="form-elements">
                    <Checkbox
                      name="deliverDateStrict"
                      label="납기엄수"
                      checked={this.state.deliverDateStrict}
                      onInputChange={this.onInputChange}
                    />
                    <Checkbox
                      name="deliverFast"
                      label="지급"
                      checked={this.state.deliverFast}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>

                {this.state.product.isPrint && (
                  <div className="form-element-container">
                    <div className="form-element__label">
                      <label>동판</label>
                    </div>
                    <div className="form-elements">
                      <RadioButton
                        name="plateStatus"
                        label="확인"
                        value="confirm"
                        disabled={!this.state.product.isPrint}
                        checked={
                          this.state.plateStatus === 'confirm' ? true : false
                        }
                        onInputChange={this.onInputChange}
                      />
                      <RadioButton
                        name="plateStatus"
                        label="신규"
                        value="new"
                        disabled={!this.state.product.isPrint}
                        checked={
                          this.state.plateStatus === 'new' ? true : false
                        }
                        onInputChange={this.onInputChange}
                      />
                      <RadioButton
                        name="plateStatus"
                        label="수정"
                        value="edit"
                        disabled={!this.state.product.isPrint}
                        checked={
                          this.state.plateStatus === 'edit' ? true : false
                        }
                        onInputChange={this.onInputChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-element-group">
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label htmlFor="workMemo">작업참고</label>
                  </div>
                  <div className="form-elements">
                    <Textarea
                      className="form-element"
                      id="workMemo"
                      value={this.state.workMemo}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label htmlFor="deliverMemo">납품참고</label>
                  </div>
                  <div className="form-elements">
                    <Textarea
                      className="form-element"
                      id="deliverMemo"
                      value={this.state.deliverMemo}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="button-group">
            <button className="button" onClick={this.onClickOK}>
              {this.state.mode === 'ADDNEW'
                ? '발주'
                : this.state.mode === 'EDIT' && '수정'}
            </button>
            <button
              className="button button-cancel"
              onClick={this.onClickCancel}
            >
              취소
            </button>
          </div>
        </form>

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
