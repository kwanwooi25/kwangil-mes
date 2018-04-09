import { Meteor } from "meteor/meteor";
import React from "react";
import Modal from "react-modal";

import { AccountsData } from "../../api/accounts";
import { ProductsData } from "../../api/products";

export default class ProductDetailView extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen            : if modal is open
  selectedID        : account ID to display
  onDetailViewClose : function to execute on modal close
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onClickOK = this.onClickOK.bind(this);
  }

  onClickOK(e) {
    e.preventDefault();
    this.props.onDetailViewClose();
  }

  comma(str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
  }

  getProductDetails() {
    const product = ProductsData.findOne({ _id: this.props.selectedID });
    const accountName = AccountsData.findOne({ _id: product.accountID }).name;

    let extSurmmaryText = "",
      printSummaryText = "",
      printFrontText = "",
      printBackText = "",
      cutPositionText = "",
      cutExtraText = "",
      cutPunchText = "",
      packDetailText = "",
      priceText = "";

    extSummaryText = `${product.extColor}원단`;
    if (product.extPretreat === "single") {
      extSummaryText += " / 단면처리";
    } else if (product.extPretreat === "both") {
      extSummaryText += " / 양면처리";
    }
    if (product.extAntistatic) {
      extSummaryText += " / 대전방지";
    }

    if (product.isPrint) {
      const printCountTotal =
        Number(product.printFrontColorCount) +
        Number(product.printBackColorCount);
      printSummaryText += `인쇄 ${printCountTotal}도`;
      printSummaryText += ` (전면 ${product.printFrontColorCount}도`;
      printFrontText = `
          전면: ${product.printFrontColorCount}도 /
                ${product.printFrontColor}
        `;
      if (product.printFrontPosition) {
        printFrontText += ` / ${product.printFrontPosition}`;
      }
      if (product.printBackColorCount) {
        printSummaryText += `, 후면 ${product.printBackColorCount}도)`;
        printBackText = `
            후면: ${product.printBackColorCount}도 /
                  ${product.printBackColor}
          `;
        if (product.printBackPosition) {
          printBackText +=` / ${product.printBackPosition}`;
        }
      } else {
        printSummaryText += ")";
      }
    }

    if (product.cutPosition) {
      cutPositionText = `가공위치: ${product.cutPosition}`;
    }

    if (product.cutUltrasonic) {
      cutExtraText = "초음파가공";
      if (product.cutPowderPack) {
        cutExtraText += " / 가루포장";
      }
    } else if (product.cutPowderPack) {
      cutExtraText = "가루포장";
    }

    if (product.cutPunches) {
      cutPunchText = `바람구멍: ${product.cutPunchCount}개`;
      if (product.cutPunchSize) {
        cutPunchText += ` (${product.cutPunchSize})`;
      }
      if (product.cutPunchPosition) {
        cutPunchText += ` / ${product.cutPunchPosition}`;
      }
    }

    packDetailText = `${product.packMaterial} 포장`;
    if (product.packQuantity) {
      packDetailText += ` (${this.comma(product.packQuantity)}매씩)`;
    }
    if (product.packDeliverAll) {
      packDetailText += " / 전량납품";
    }

    if (product.price) {
      priceText = `단가: ${product.price}원`;
    }

    return (
      <div className="product-detail__container">
        <div className="product-detail__subsection">
          <h3 className="product-detail__accountName">{accountName}</h3>
          <h2 className="product-detail__productName">{product.name}</h2>
          <p className="product-detail__description">
            {product.thick} &times; {product.length} &times; {product.width}
          </p>
          <p className="product-detail__description">
            {product.isPrint ? printSummaryText : "무지"}
          </p>
        </div>

        <div className="product-detail__subsection">
          <h3 className="product-detail__subtitle">압출</h3>
          <p className="product-detail__description">{extSummaryText}</p>
          <p className="product-detail__description">{product.extMemo}</p>
        </div>

        {product.isPrint ? (
          <div className="product-detail__subsection">
            <h3 className="product-detail__subtitle">인쇄</h3>
            <img
              className="product-detail__print-image"
              src={product.printImageURL}
            />
            <p className="product-detail__description">{printFrontText}</p>
            <p className="product-detail__description">{printBackText}</p>
            <p className="product-detail__description">{product.printMemo}</p>
          </div>
        ) : (
          undefined
        )}

        <div className="product-detail__subsection">
          <h3 className="product-detail__subtitle">가공</h3>
          <p className="product-detail__description">{cutPositionText}</p>
          <p className="product-detail__description">{cutExtraText}</p>
          <p className="product-detail__description">{cutPunchText}</p>
          <p className="product-detail__description">{product.cutMemo}</p>
        </div>

        <div className="product-detail__subsection">
          <h3 className="product-detail__subtitle">포장</h3>
          <p className="product-detail__description">{packDetailText}</p>
          <p className="product-detail__description">{product.packMemo}</p>
        </div>

        <div className="product-detail__subsection">
          <h3 className="product-detail__subtitle">관리자 참고사항</h3>
          <p className="product-detail__description">{priceText}</p>
          <p className="product-detail__description">{product.memo}</p>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onDetailViewClose}
        ariaHideApp={false}
        className="boxed-view__box product-detail-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>품목 상세정보</h1>
        </div>
        <div className="boxed-view__content">{this.getProductDetails()}</div>
        <div className="product-modal__button-group">
          <button className="button" onClick={this.onClickOK}>
            확인
          </button>
        </div>
      </Modal>
    );
  }
}
