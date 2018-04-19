import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';
import { comma, uncomma } from '../../api/comma';

export default class OrderDetailView extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen
  orderID
  onModalClose
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onClickOK = this.onClickOK.bind(this);
  }

  onClickOK(e) {
    e.preventDefault();
    this.props.onModalClose();
  }

  getOrderDetails() {
    const order = OrdersData.findOne({ _id: this.props.orderID });
    const product = ProductsData.findOne({ _id: order.data.productID });
    const account = AccountsData.findOne({ _id: product.accountID });

    // variables
    let orderedAtText = '';
    let deliverBeforeText = '';
    let orderInfoText = '';
    let productExtText = '';
    let productPrintSummaryText = '';
    let productPrintFrontText = '';
    let productPrintBackText = '';
    let productCutPositionText = '';
    let productCutRemarkText = '';
    let productCutPunchesText = '';
    let productPackDetailText = '';

    orderedAtText = `발주일: ${order.data.orderedAt}`;
    deliverBeforeText = `납기일: ${order.data.deliverBefore}`;

    // product info & order quantity
    let productSize = `
      ${product.thick} x ${product.length} x ${product.width}
    `;
    let orderQuantity = `
      ${comma(uncomma(order.data.orderQuantity))}매
    `;
    let orderQuantityInWeight =
      Number(product.thick) *
      (Number(product.length) + 5) *
      (Number(product.width) / 100) *
      0.0184 *
      Number(uncomma(order.data.orderQuantity));
    orderInfoText = `
      ${productSize} = ${orderQuantity} (${comma(orderQuantityInWeight.toFixed(0))}kg)
      `;

    // product extrusion detail
    productExtText = `${product.extColor}원단`;
    if (product.extPretreat === 'single') {
      productExtText += ' / 단면처리';
    } else if (product.extPretreat === 'both') {
      productExtText += ' / 양면처리';
    }
    if (product.extAntistatic) {
      productExtText += ' / 대전방지';
    }

    // product print detail
    if (product.isPrint) {
      const printCountTotal =
        Number(product.printFrontColorCount) +
        Number(product.printBackColorCount);
      productPrintSummaryText += `인쇄 ${printCountTotal}도`;
      productPrintSummaryText += ` (전면 ${product.printFrontColorCount}도`;
      productPrintFrontText = `
          전면: ${product.printFrontColorCount}도 /
                ${product.printFrontColor}
        `;
      if (product.printFrontPosition) {
        productPrintFrontText += ` / ${product.printFrontPosition}`;
      }
      if (product.printBackColorCount) {
        productPrintSummaryText += `, 후면 ${product.printBackColorCount}도)`;
        productPrintBackText = `
            후면: ${product.printBackColorCount}도 /
                  ${product.printBackColor}
          `;
        if (product.printBackPosition) {
          productPrintBackText += ` / ${product.printBackPosition}`;
        }
      } else {
        productPrintSummaryText += ')';
      }
    }

    // product cut detail
    if (product.cutPosition) {
      productCutPositionText = `가공위치: ${product.cutPosition}`;
    }

    if (product.cutUltrasonic) {
      productCutRemarkText = '초음파가공';
      if (product.cutPowderPack) {
        productCutRemarkText += ' / 가루포장';
      }
    } else if (product.cutPowderPack) {
      productCutRemarkText = '가루포장';
    }

    if (product.cutPunches) {
      productCutPunchesText = `바람구멍: ${product.cutPunchCount}개`;
      if (product.cutPunchSize) {
        productCutPunchesText += ` (${product.cutPunchSize})`;
      }
      if (product.cutPunchPosition) {
        productCutPunchesText += ` / ${product.cutPunchPosition}`;
      }
    }

    // product pack detail
    productPackDetailText = `${product.packMaterial} 포장`;
    if (product.packQuantity) {
      productPackDetailText += ` (${comma(product.packQuantity)}매씩)`;
    }
    if (product.packDeliverAll) {
      productPackDetailText += ' / 전량납품';
    }

    return (
      <div className="order-detail__container">
        <div className="order-detail__subsection">
          <h2 className="order-detail__orderID">{order._id}</h2>
          {order.data.deliverFast ? (
            <span className="order-detail__deliverRemark">
              <i className="fa fa-star" /> 지급
            </span>
          ) : (
            undefined
          )}
          {order.data.deliverDateStrict ? (
            <span className="order-detail__deliverRemark">
              <i className="fa fa-star" /> 납기엄수
            </span>
          ) : (
            undefined
          )}
        </div>
        <div className="order-detail__subsection">
          <span className="order-detail__dates">{orderedAtText}</span>
          <span className="order-detail__dates">{deliverBeforeText}</span>
        </div>
        <div className="order-detail__subsection">
          <h5 className="order-detail__accountName">{account.name}</h5>
          <h4 className="order-detail__productName">{product.name}</h4>
          <p className="order-detail__orderInfo">{orderInfoText}</p>
        </div>
        <div className="order-detail__subsection">
          <h3 className="order-detail__subtitle">압출</h3>
          <p className="order-detail__description">{productExtText}</p>
          <p className="order-detail__description">{product.extMemo}</p>
        </div>
        {product.isPrint ? (
          <div className="order-detail__subsection">
            <h3 className="order-detail__subtitle">인쇄</h3>
            <p className="order-detail__description">
              {productPrintSummaryText}
            </p>
            <p className="order-detail__description">{productPrintFrontText}</p>
            {productPrintBackText ? (
              <p className="order-detail__description">
                {productPrintBackText}
              </p>
            ) : (
              undefined
            )}
            <p className="order-detail__description">{product.printMemo}</p>
            <img
              className="order-detail__print-image"
              src={product.printImageURL}
            />
          </div>
        ) : (
          undefined
        )}

        <div className="order-detail__subsection">
          <h3 className="order-detail__subtitle">가공</h3>
          <p className="order-detail__description">{productCutPositionText}</p>
          <p className="order-detail__description">{productCutRemarkText}</p>
          <p className="order-detail__description">{productCutPunchesText}</p>
          <p className="order-detail__description">{product.cutMemo}</p>
        </div>

        <div className="order-detail__subsection">
          <h3 className="order-detail__subtitle">포장</h3>
          <p className="order-detail__description">{productPackDetailText}</p>
          <p className="order-detail__description">{product.packMemo}</p>
        </div>

        <div className="order-detail__subsection">
          <h3 className="order-detail__subtitle">작업시 참고사항</h3>
          <p className="order-detail__description">{order.data.workMemo}</p>
        </div>

        <div className="order-detail__subsection">
          <h3 className="order-detail__subtitle">납품시 참고사항</h3>
          <p className="order-detail__description">{order.data.deliverMemo}</p>
        </div>

        {/* <div className="order-detail__subsection">
          <h3 className="order-detail__subtitle">관리자 참고사항</h3>
          <p className="order-detail__description">{priceText}</p>
          <p className="order-detail__description">{product.memo}</p>
        </div> */}
      </div>
    );
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box order-detail-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>주문 상세정보</h1>
        </div>
        <div className="boxed-view__content">{this.getOrderDetails()}</div>
        <div className="button-group">
          <button className="button" onClick={this.onClickOK}>
            확인
          </button>
        </div>
      </Modal>
    );
  }
}
