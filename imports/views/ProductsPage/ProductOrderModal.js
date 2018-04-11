import { Meteor } from "meteor/meteor";
import React from "react";
import Modal from "react-modal";
import moment from "moment";

import { AccountsData } from "../../api/accounts";
import { ProductsData } from "../../api/products";

import DatePicker from "../../custom/DatePicker";
import TextInput from "../../custom/TextInput";
import Textarea from "../../custom/Textarea";
import RadioButton from "../../custom/RadioButton";
import Checkbox from "../../custom/Checkbox";
import Accordion from "../../custom/Accordion";
import ConfirmationModal from "../components/ConfirmationModal";


export default class ProductModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  selectedID   : product ID to display
  onModalClose : function to execute on modal close
  isAdmin
  isManager
  ==========================================================================*/
  constructor(props) {
    super(props);

    const product = ProductsData.findOne({ _id: props.selectedID });
    this.state = {
      productID: product._id,
      accountID: product.accountID,
      accountName: product.accountName,
      name: product.name,
      thick: product.thick,
      length: product.length,
      width: product.width,
      isPrint: product.isPrint,
      extColor: product.extColor,
      extPretreat: product.extPretreat,
      printImageURL: product.printImageURL,
      printFrontColorCount: product.printFrontColorCount,
      printFrontColor: product.printFrontColor,
      printFrontPosition: product.printFrontPosition,
      printBackColorCount: product.printBackColorCount,
      printBackColor: product.printBackColor,
      printBackPosition: product.printBackPosition,
      cutUltrasonic: product.cutUltrasonic,
      cutPowderPack: product.cutPowderPack,
      cutPunches: product.cutPunches,
      cutPunchCount: product.cutPunchCount,
      packMaterial: product.packMaterial,
      packQuantity: product.packQuantity,
      packDeliverAll: product.packDeliverAll,
      orderedAt: moment(),
      deliverBefore: moment(),
      orderQuantity: "",
      deliverDateStrict: false,
      deliverFast: false,
      plateStatus: "confirm", // "confirm" : 확인, "new" : 신규, "edit" : 수정
      workMemo: "",
      deliverMemo: "",
      orderedAtEmpty: false,
      deliverBeforeEmpty: false,
      orderQuantityEmpty: false,
      isConfirmationModalOpen: false,
      confirmationTitle: "",
      confirmationDescription: ""
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onConfirmationModalClose = this.onConfirmationModalClose.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
  }

  componentDidMount() {
    // set deliverBefore
    if (this.state.isPrint) {
      const deliverBefore = this.avoidWeekend(moment().add(10, "days"));
      this.setState({ deliverBefore });
    }
  }

  // function to set deliverBefore date to be weekdays
  // passes moment() object
  avoidWeekend(date) {
    if (date.day() === 6) {
      date = date.subtract(1, "days");
    } else if (date.day() === 7) {
      date = date.add(1, "days");
    }
    return date;
  }

  comma(str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
  }

  uncomma(str) {
    str = String(str);
    return str.replace(/[^\d]+/g, "");
  }

  getProductInfo() {
    const sizeText = `
      ${this.state.thick} x ${this.state.length} x ${this.state.width}
    `;
    let printText = "";
    let printDetailText = "";
    if (this.state.isPrint) {
      printText = `인쇄 ${Number(this.state.printFrontColorCount) +
        Number(this.state.printBackColorCount)}도`;
      printDetailText = `전면 ${this.state.printFrontColorCount}도: ${
        this.state.printFrontColor
      }`;
      if (this.state.printBackColorCount) {
        printDetailText += ` / 후면 ${this.state.printBackColorCount}도: ${
          this.state.printBackColor
        }`;
      }
    } else {
      printText = `무지`;
    }

    return (
      <div className="product-order-modal__product-info-container">
        <p className="product-order-modal__accountName">
          {this.state.accountName}
        </p>
        <p className="product-order-modal__productName">{this.state.name}</p>
        <p className="product-order-modal__size">{sizeText}</p>
        <p className="product-order-modal__isPrint">{printText}</p>
        <p className="product-order-modal__isPrint">{printDetailText}</p>
        <img
          classNme="product-order-modal__printImage"
          src={this.state.printImageURL}
        />
      </div>
    );
  }

  onInputChange(e) {
    if (e.target.name === "orderQuantity") {
      this.setState({
        [e.target.name]: this.comma(this.uncomma(e.target.value))
      });
    } else if (e.target.type === "checkbox") {
      this.setState({ [e.target.name]: e.target.checked });
    } else {
      this.setState({ [e.target.name]: e.target.value });
    }

    // check validation
    if (e.target.type !== "checkbox" && e.target.type !== "radio") {
      this.validate(e.target.name, e.target.value);
    }
  }

  validate(name, value) {
    const inputContainer = document.getElementById(name).parentNode;

    // check if the value empty
    if (value === "" || value === null) {
      this.setState({ [`${name}Empty`]: true });
      inputContainer.classList.add("error");
      return false;
    } else {
      this.setState({ [`${name}Empty`]: false });
      inputContainer.classList.remove("error");
      return true;
    }
  }

  onClickOK(e) {
    e.preventDefault();

    console.log("onClickOK: ", this.state);

    // validation
    if (!this.validate("orderedAt", this.state.orderedAt)) {
      document.getElementById("orderedAt").focus();
    } else if (!this.validate("deliverBefore", this.state.deliverBefore)) {
      document.getElementById("deliverBefore").focus();
    } else if (!this.validate("orderQuantity", this.state.orderQuantity)) {
      document.getElementById("orderQuantity").focus();
    } else {
      this.setState({
        isConfirmationModalOpen: true,
        confirmationTitle: "신규 작업지시",
        confirmationDescription: `
          [ ${this.state.name} :
          ${this.state.thick} x
          ${this.state.length} x
          ${this.state.width} =
          ${this.comma(this.state.orderQuantity)}매 ]
          작업지시 하시겠습니까?
        `
      });
    }
  }

  onConfirmationModalClose(answer) {
    this.setState({ isConfirmationModalOpen: false });
    //
    // // ADDNEW mode
    // if (this.state.mode === "ADDNEW" && answer) {
    //   if (this.refs.printImageFile && this.refs.printImageFile.files[0]) {
    //     this.uploadImage(this.refs.printImageFile.files[0]).then(
    //       convertedURL => {
    //         this.setState({ printImageURL: convertedURL }, () => {
    //           const data = this.getDataToSave();
    //           Meteor.call("products.insert", data, (err, res) => {
    //             if (!err) {
    //               this.props.onModalClose();
    //             } else {
    //               this.setState({ error: err.error });
    //             }
    //           });
    //         });
    //       }
    //     );
    //   } else {
    //     const data = this.getDataToSave();
    //     Meteor.call("products.insert", data, (err, res) => {
    //       if (!err) {
    //         this.props.onModalClose();
    //       } else {
    //         this.setState({ error: err.error });
    //       }
    //     });
    //   }
    //
    //   // EDIT mode
    // } else if (this.state.mode === "EDIT" && answer) {
    //   if (
    //     initialState.printImageFileName !== this.state.printImageFileName &&
    //     this.refs.printImageFile.files[0]
    //   ) {
    //     this.uploadImage(this.refs.printImageFile.files[0]).then(
    //       convertedURL => {
    //         this.setState({ printImageURL: convertedURL }, () => {
    //           const data = this.getDataToSave();
    //           Meteor.call(
    //             "products.update",
    //             this.state.productID,
    //             data,
    //             (err, res) => {
    //               if (!err) {
    //                 this.props.onModalClose();
    //               } else {
    //                 this.setState({ error: err.error });
    //               }
    //             }
    //           );
    //         });
    //       }
    //     );
    //   } else {
    //     const data = this.getDataToSave();
    //     Meteor.call(
    //       "products.update",
    //       this.state.productID,
    //       data,
    //       (err, res) => {
    //         if (!err) {
    //           this.props.onModalClose();
    //         } else {
    //           this.setState({ error: err.error });
    //         }
    //       }
    //     );
    //   }
    // }
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
          document.getElementById("orderQuantity").focus();
        }}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box product-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>작업지시 작성</h1>
        </div>
        <form className="boxed-view__content product-modal__content">
          <div className="accordion-container">
            <Accordion title="제품정보" />
            <div className="accordion-panel open">{this.getProductInfo()}</div>
          </div>

          <div className="accordion-container">
            <Accordion title="작업지시 내용" />
            <div className="accordion-panel open">
              <div className="form-element-group">
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label htmlFor="orderedAt">발주일</label>
                  </div>
                  <div className="form-elements">
                    <DatePicker
                      className="form-element"
                      id="orderedAt"
                      date={this.state.orderedAt}
                      onDateChange={orderedAt => {
                        this.setState({ orderedAt });
                      }}
                      isOutsideRange={() => {
                        return false;
                      }}
                      errorMessage={
                        this.state.orderedAtEmpty
                          ? "발주일을 입력하세요."
                          : undefined
                      }
                    />
                  </div>
                </div>
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label htmlFor="deliverBefore">납기일</label>
                  </div>
                  <div className="form-elements">
                    <DatePicker
                      className="form-element"
                      id="deliverBefore"
                      date={this.state.deliverBefore}
                      onDateChange={deliverBefore => {
                        this.setState({ deliverBefore });
                      }}
                      errorMessage={
                        this.state.deliverBeforeEmpty
                          ? "납기일을 입력하세요."
                          : undefined
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
                          ? "발주수량을 입력하세요."
                          : undefined
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

                <div className="form-element-container">
                  <div className="form-element__label">
                    <label>동판</label>
                  </div>
                  <div className="form-elements">
                    <RadioButton
                      name="plateStatus"
                      label="확인"
                      value="confirm"
                      disabled={!this.state.isPrint}
                      checked={
                        this.state.plateStatus === "confirm" ? true : false
                      }
                      onInputChange={this.onInputChange}
                    />
                    <RadioButton
                      name="plateStatus"
                      label="신규"
                      value="new"
                      disabled={!this.state.isPrint}
                      checked={this.state.plateStatus === "new" ? true : false}
                      onInputChange={this.onInputChange}
                    />
                    <RadioButton
                      name="plateStatus"
                      label="수정"
                      value="edit"
                      disabled={!this.state.isPrint}
                      checked={this.state.plateStatus === "edit" ? true : false}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>
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

          <div className="product-modal__button-group">
            <button className="button" onClick={this.onClickOK}>
              발주
            </button>
            <button
              className="button button-cancel"
              onClick={this.onClickCancel}
            >
              취소
            </button>
          </div>
        </form>
        {this.state.isConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title={this.state.confirmationTitle}
            description={this.state.confirmationDescription}
            onModalClose={this.onConfirmationModalClose}
          />
        ) : (
          undefined
        )}
      </Modal>
    );
  }
}
