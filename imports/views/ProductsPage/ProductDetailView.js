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

  getProductDetails() {
    const product = ProductsData.findOne({ _id: this.props.selectedID });
    const accountName = AccountsData.findOne({ _id: product.accountID }).name;
    let printText = "";
    if (product.isPrint) {
      printText += `인쇄 ${Number(product.printFrontColorCount) +
        Number(product.printBackColorCount)}도 (전면 ${
        product.printFrontColorCount
      }도`;
      if (product.printBackColorCount) {
        printText += `, 후면 ${product.printBackColorCount}도)`;
      } else {
        printText += ")";
      }
    }

    return (
      <div className="product-detail__container">
        <div className="product-detail__subsection">
          <div className="product-detail__row">
            <h3 className="product-detail__accountName">{accountName}</h3>
          </div>
          <div className="product-detail__row">
            <h2 className="product-detail__productName">{product.name}</h2>
          </div>
        </div>
        <div className="product-detail__subsection">
          <div className="product-detail__row md50">
            <p className="product-detail__description">
              {product.thick} &times; {product.length} &times; {product.width}
            </p>
          </div>
          <div className="product-detail__row md45">
            <p className="product-detail__description">
              {product.isPrint ? printText : "무지"}
            </p>
          </div>
        </div>

        <div className="product-detail__subsection">
          <h3 className="product-detail__subtitle">압출</h3>
          <div className="product-detail__row">
            <p className="product-detail__description">
              {product.extColor}원단
              {product.extPretreat === "single"
                ? " / 단면처리"
                : product.extPretreat === "both" ? " / 양면처리" : undefined}
              {product.extAntistatic ? " / 대전방지" : undefined}
            </p>
          </div>
          <div className="product-detail__row">
            <p className="product-detail__description">{product.extMemo}</p>
          </div>
        </div>

        {product.isPrint ? (
          <div className="product-detail__subsection">
            <h3 className="product-detail__subtitle">인쇄</h3>
            <div className="product-detail__row">
              <img
                className="product-detail__printImage"
                src={product.printImageURL}
              />
            </div>
            <div className="product-detail__row">
              <p className="product-detail__description">
                전면: {product.printFrontColorCount}도 ({
                  product.printFrontColor
                })
              </p>
              <p className="product-detail__description">
                {product.printFrontPosition}
              </p>
              {product.printBackColorCount ? (
                <p className="product-detail__description">
                  후면: {product.printBackColorCount}도 ({
                    product.printBackColor
                  })
                </p>
              ) : (
                undefined
              )}
              {product.printBackColorCount ? (
                <p className="product-detail__description">
                  {product.printBackPosition}
                </p>
              ) : (
                undefined
              )}
            </div>

            <div className="product-detail__row">
              <p className="product-detail__description">{product.printMemo}</p>
            </div>
          </div>
        ) : (
          undefined
        )}

        <div className="product-detail__subsection">
          <h3 className="product-detail__subtitle">가공</h3>
          <div className="product-detail__row">
            <p className="product-detail__description">
              {product.cutPosition
                ? `가공위치: ${product.cutPosition}`
                : undefined}
            </p>
          </div>
          <div className="product-detail__row">
            <p className="product-detail__description">
              {product.cutUltrasonic ? "초음파가공" : undefined}
              {product.cutUltrasonic && product.cutPowderPack
                ? " / "
                : undefined}
              {product.cutPowderPack ? "가루포장" : undefined}
            </p>
          </div>
          {product.cutPunches ? (
            <div className="product-detail__row">
              <p className="product-detail__description">
                바람구멍: {product.cutPunchCount}개{" "}
                {product.cutPunchSize ? `(${product.cutPunchSize})` : undefined}
              </p>
              <p className="product-detail__description">
                {product.cutPunchPosition}
              </p>
            </div>
          ) : (
            undefined
          )}
          <div className="product-detail__row">
            <p className="product-detail__description">{product.cutMemo}</p>
          </div>
        </div>

        <div className="product-detail__subsection">
          <h3 className="product-detail__subtitle">포장</h3>
          <div className="product-detail__row">
            <p className="product-detail__description">
              {product.packMaterial}포장{" "}
              {product.packQuantity
                ? `(${product.packQuantity}매씩)`
                : undefined}{" "}
              {product.packDeliverAll ? " / 전량납품" : undefined}
            </p>
          </div>
          <div className="product-detail__row">
            <p className="product-detail__description">{product.packMemo}</p>
          </div>
        </div>

        <div className="product-detail__subsection">
          <h3 className="product-detail__subtitle">관리자 참고사항</h3>
          <div className="product-detail__row">
            <p className="product-detail__description">
              {product.price ? `단가: ${product.price}원` : undefined}
            </p>
          </div>
          <div className="product-detail__row">
            <p className="product-detail__description">{product.memo}</p>
          </div>
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
        className="boxed-view__box product-modal"
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
