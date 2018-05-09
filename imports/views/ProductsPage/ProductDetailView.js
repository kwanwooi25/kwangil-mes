import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { PlatesData } from '../../api/plates';
import { comma, uncomma } from '../../api/comma';

import PlateName from '../components/PlateName';
import noImage from '../../assets/no-image.png';

export default class ProductDetailView extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  isOpen
  productID
  onModalClose
  ========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      isPlateDetailViewOpen: false,
      selectedPlateID: ''
    };

    this.onClickOK = this.onClickOK.bind(this);
  }

  componentDidMount() {
    //tracks if the user logged in is admin or manager
    this.authTracker = Tracker.autorun(() => {
      if (Meteor.user()) {
        this.setState({
          isAdmin: Meteor.user().profile.isAdmin,
          isManager: Meteor.user().profile.isManager
        });
      }
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
  }

  onClickOK(e) {
    e.preventDefault();
    this.props.onModalClose();
  }

  getProductDetails() {
    const product = ProductsData.findOne({ _id: this.props.productID });
    const account = AccountsData.findOne({ _id: product.accountID });
    const plateList = PlatesData.find({
      'forProductList.productID': product._id
    }).fetch();

    let extSurmmaryText = '',
      printSummaryText = '',
      printFrontText = '',
      printBackText = '',
      cutPositionText = '',
      cutExtraText = '',
      cutPunchText = '',
      packDetailText = '',
      priceText = '';

    extSummaryText = `${product.extColor}원단`;
    if (product.extPretreat === 'single') {
      extSummaryText += ' / 단면처리';
    } else if (product.extPretreat === 'both') {
      extSummaryText += ' / 양면처리';
    }
    if (product.extAntistatic) {
      extSummaryText += ' / 대전방지';
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
          printBackText += ` / ${product.printBackPosition}`;
        }
      } else {
        printSummaryText += ')';
      }
    }

    if (product.cutPosition) {
      cutPositionText = `가공위치: ${product.cutPosition}`;
    }

    if (product.cutUltrasonic) {
      cutExtraText = '초음파가공';
      if (product.cutPowderPack) {
        cutExtraText += ' / 가루포장';
      }
    } else if (product.cutPowderPack) {
      cutExtraText = '가루포장';
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
      packDetailText += ` (${comma(product.packQuantity)}매씩)`;
    }
    if (product.packDeliverAll) {
      packDetailText += ' / 전량납품';
    }

    if (product.price) {
      priceText = `단가: ${product.price}원`;
    }

    // display plate list
    const getPlateList = plateList => {
      return plateList.map((plate, index) => {
        const printContent = plate.forProductList.find(
          forProduct => forProduct.productID === product._id
        ).printContent;

        return (
          <li key={plate._id} className="product-detail__plateListItem">
            <span>동판 {index + 1}:</span>
            <PlateName
              className="product-detail__plateSize"
              plateID={plate._id}
              plateRound={plate.round}
              plateLength={plate.length}
            />
            <span>{printContent}</span>
          </li>
        );
      });
    };

    // display history
    const getHistory = () => {
      let historyArrayToDisplay = [];
      if (product.olderHistory) {
        const olderHistoryString = product.olderHistory;
        historyArrayToDisplay = olderHistoryString.split('\r\r\n');
      }
      if (product.history) {
        const historyArray = product.history;
        historyArray
          .sort((a, b) => {
            if (a._id > b._id) return 1;
            if (a._id < b._id) return -1;
            return 0;
          })
          .map(history => {
            historyArrayToDisplay.push(
              `${history._id} 수량: ${comma(history.orderQuantity)}매`
            );
          });
      }

      return historyArrayToDisplay.map((history, index) => (
        <li key={index}>{history}</li>
      ));
    };

    return (
      <div className="product-detail__container">
        <div className="product-detail__subsection">
          <h3 className="product-detail__accountName">
            {account ? account.name : '[삭제된 업체]'}
          </h3>
          <h2 className="product-detail__productName">{product.name}</h2>
          <p className="product-detail__description">
            {product.thick} &times; {product.length} &times; {product.width}
          </p>
          <p className="product-detail__description">
            {product.isPrint ? printSummaryText : '무지'}
          </p>
        </div>

        <div className="product-detail__subsection">
          <h3 className="product-detail__subtitle">압출</h3>
          <p className="product-detail__description">{extSummaryText}</p>
          <p className="product-detail__description">{product.extMemo}</p>
        </div>

        {product.isPrint && (
          <div className="product-detail__subsection">
            <h3 className="product-detail__subtitle">인쇄</h3>
            <p className="product-detail__description">{printFrontText}</p>
            <p className="product-detail__description">{printBackText}</p>
            {plateList && (
              <ul className="product-detail__plateList">
                {getPlateList(plateList)}
              </ul>
            )}
            <p className="product-detail__description">{product.printMemo}</p>
            <div className="product-detail__print-image">
              <img
                src={product.printImageURL}
                onError={e => (e.target.src = noImage)}
              />
              {product.printImageURL && (
                <div className="image-overlay">
                  <a
                    className="product-detail__image-link"
                    href={product.printImageURL}
                    target="_blank"
                  >
                    <i className="fa fa-expand" />
                  </a>
                </div>
              )}
            </div>
          </div>
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

        {(this.state.isAdmin || this.state.isManager) && (
          <div className="product-detail__subsection">
            <h3 className="product-detail__subtitle">관리자 참고사항</h3>
            <p className="product-detail__description">{priceText}</p>
            <p className="product-detail__description">{product.memo}</p>
          </div>
        )}

        {product.olderHistory && (
          <div className="product-detail__subsection">
            <h3 className="product-detail__subtitle">작업이력</h3>
            <ul className="product-detail__history-container">
              {getHistory()}
            </ul>
          </div>
        )}
      </div>
    );
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box product-detail-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>품목 상세정보</h1>
        </div>
        <div className="boxed-view__content">{this.getProductDetails()}</div>
        <div className="button-group">
          <button className="button" onClick={this.onClickOK}>
            확인
          </button>
        </div>
      </Modal>
    );
  }
}
