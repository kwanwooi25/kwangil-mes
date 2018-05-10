import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { PlatesData } from '../../api/plates';
import { comma, uncomma } from '../../api/comma';

import noImage from '../../assets/no-image.png';

export default class PlateDetailView extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen
  plateID
  onModalClose
  ========================================================================*/
  constructor(props) {
    super(props);

    this.onClickOK = this.onClickOK.bind(this);
  }

  onClickOK(e) {
    e.preventDefault();
    this.props.onModalClose();
  }

  getPlateDetails() {
    const plate = PlatesData.findOne({ _id: this.props.plateID });

    let plateSizeText = '';
    let plateMaterialText = '';
    let plateLocationText = '';

    plateSizeText = `${plate.round} x ${plate.length}`;
    plateSizeText +=
      plate.material === 'brass'
        ? ' (신주판)'
        : plate.material === 'iron' && ' (데스판)';
    plateLocationText = `동판 보관위치: ${plate.location}`;

    const getForProductList = () => {
      return plate.forProductList.map(({ productID, printContent }) => {
        const product = ProductsData.findOne({ _id: productID });
        let productSize = '';
        if (product) {
          productSize = `${product.thick} x ${product.length} x ${product.width}`;
        } else {
          productSize = '[삭제된 품목]';
        }

        return (
          <li key={productID} className="plate-detail__forProductListItem">
            <span>{product ? product.name : '[삭제된 품목]'}</span>
            <span>{productSize}</span>
            <span>{printContent}</span>
          </li>
        );
      });
    };

    return (
      <div className="plate-detail__container">
        <div className="plate-detail__subsection">
          <h2 className="plate-detail__plateSize">{plateSizeText}</h2>
          {plate.location && (
            <p className="plate-detail__description">{plateLocationText}</p>
          )}
        </div>

        <div className="plate-detail__subsection">
          <h3 className="plate-detail__subtitle">사용품목</h3>
          <ul className="plate-detail__forProductList">
            {getForProductList()}
          </ul>
        </div>

        <div className="plate-detail__subsection">
          <h3 className="plate-detail__subtitle">메모</h3>
          <p className="plate-detail__description">{plate.memo}</p>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box plate-detail-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>동판 상세정보</h1>
        </div>
        <div className="boxed-view__content">{this.getPlateDetails()}</div>
        <div className="button-group">
          <button className="button" onClick={this.onClickOK}>
            확인
          </button>
        </div>
      </Modal>
    );
  }
}
