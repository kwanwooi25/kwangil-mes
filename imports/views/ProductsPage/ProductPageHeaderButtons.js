import React from 'react';

import { exportCSV } from '../../api/exportCSV';

import ProductModal from './ProductModal';
import AddNewMultiModal from '../components/AddNewMultiModal';

export default class ProductPageHeaderButtons extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  accountsData
  filteredProductsData
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      filteredProductsData: props.filteredProductsData,
      isModalNewOpen: false,
      isModalNewMultiOpen: false
    };

    this.onClickNew = this.onClickNew.bind(this);
    this.onClickNewMulti = this.onClickNewMulti.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
    this.onClickExportExcel = this.onClickExportExcel.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({ filteredProductsData: props.filteredProductsData });
  }

  onClickNew() {
    this.setState({ isModalNewOpen: true });
  }

  onClickNewMulti() {
    this.setState({ isModalNewMultiOpen: true });
  }

  onModalClose() {
    this.setState({ isModalNewOpen: false, isModalNewMultiOpen: false });
  }

  onClickExportExcel() {
    const filename = '광일_제품목록.csv';
    const products = this.state.filteredProductsData;
    let keys = [];
    let headerCSV = '';
    if (this.props.isAdmin) {
      keys = [
        'accountID',
        'accountName',
        '_id',
        'name',
        'thick',
        'length',
        'width',
        'isPrint',
        'extColor',
        'extAntistatic',
        'extPretreat',
        'extMemo',
        'printImageURL',
        'printFrontColorCount',
        'printFrontColor',
        'printFrontPosition',
        'printBackColorCount',
        'printBackColor',
        'printBackPosition',
        'printMemo',
        'cutPosition',
        'cutUltrasonic',
        'cutPowderPack',
        'cutPunches',
        'cutPunchCount',
        'cutPunchSize',
        'cutPunchPosition',
        'cutMemo',
        'packMaterial',
        'packQuantity',
        'packDeliverAll',
        'packMemo',
        'stockQuantity',
        'price',
        'history',
        'memo'
      ];

      headerCSV =
        '업체ID,업체명,제품ID,제품명,두께,길이,너비,무지_인쇄,원단색상,대전방지,처리,압출메모,도안URL,전면도수,전면색상,전면위치,후면도수,후면색상,후면위치,인쇄메모,가공위치,초음파가공,가루포장,바람구멍,바람구멍개수,바람구멍크기,바람구멍위치,가공메모,포장방법,포장수량,전량납품,포장메모,재고수량,가격,작업이력,메모';
    } else {
      keys = [
        'accountName',
        'name',
        'thick',
        'length',
        'width',
        'isPrint',
        'extColor',
        'extAntistatic',
        'extPretreat',
        'extMemo',
        'printImageURL',
        'printFrontColorCount',
        'printFrontColor',
        'printFrontPosition',
        'printBackColorCount',
        'printBackColor',
        'printBackPosition',
        'printMemo',
        'cutPosition',
        'cutUltrasonic',
        'cutPowderPack',
        'cutPunches',
        'cutPunchCount',
        'cutPunchSize',
        'cutPunchPosition',
        'cutMemo',
        'packMaterial',
        'packQuantity',
        'packDeliverAll',
        'packMemo',
        'stockQuantity'
      ];

      headerCSV =
        '업체명,제품명,두께,길이,너비,무지_인쇄,원단색상,대전방지,처리,압출메모,도안URL,전면도수,전면색상,전면위치,후면도수,후면색상,후면위치,인쇄메모,가공위치,초음파가공,가루포장,바람구멍,바람구멍개수,바람구멍크기,바람구멍위치,가공메모,포장방법,포장수량,전량납품,포장메모,재고수량';

      if (this.props.isManager) {
        keys.push(['price', 'history', 'memo']);
        headerCSV += ',가격,작업이력,메모';
      }
    }

    // generate body csv from account list
    const bodyCSV = products
      .map(product => {
        return keys
          .map(key => {
            switch (key) {
              case 'accountName':
                const accountName = this.props.accountsData.find(
                  account => account._id === product.accountID
                ).name;
                return '"t"'.replace('t', accountName);

              case 'isPrint':
                const isPrint = product[key] ? '인쇄' : '무지';
                return '"t"'.replace('t', isPrint);

              case 'extPretreat':
                const extPretreat =
                  product[key] === 'single'
                    ? '단면'
                    : product[key] === 'both' ? '양면' : '';
                return '"t"'.replace('t', extPretreat);

              case 'extAntistatic':
              case 'cutUltrasonic':
              case 'cutPunches':
              case 'cutPowderPack':
              case 'packDeliverAll':
                return '"t"'.replace('t', product[key] ? 'yes' : '');

              case 'history':
                let historyString = '';
                if (product[key]) {
                  product[key].map(history => {
                    historyString += `${history._id} 수량: ${
                      history.orderQuantity
                    }매`;
                  });
                }
                return historyString;

              default:
                let value = '';
                if (product[key] !== undefined) value = product[key];
                return '"t"'.replace('t', value);
            }
          })
          .join(',');
      })
      .join('\r\n');

    exportCSV(headerCSV, bodyCSV, filename);
  }

  render() {
    return (
      <div className="page-header__buttons">
        <button
          className="button button-with-icon-span page-header__button"
          onClick={this.onClickExportExcel}
          disabled={this.state.filteredProductsData.length === 0}
        >
          <i className="fa fa-table fa-lg" />
          <span>엑셀</span>
        </button>
        {this.props.isAdmin && (
          <button
            className="button button-with-icon-span page-header__button"
            onClick={this.onClickNewMulti}
          >
            <i className="fa fa-plus-square fa-lg" />
            <span>대량등록</span>
          </button>
        )}
        {(this.props.isAdmin || this.props.isManager) && (
          <button
            className="button button-with-icon-span page-header__button"
            onClick={this.onClickNew}
          >
            <i className="fa fa-plus fa-lg" />
            <span>신규</span>
          </button>
        )}

        {this.state.isModalNewOpen && (
          <ProductModal
            isOpen={this.state.isModalNewOpen}
            onModalClose={this.onModalClose}
            isAdmin={this.props.isAdmin}
            isManager={this.props.isManager}
          />
        )}

        {this.state.isModalNewMultiOpen && (
          <AddNewMultiModal
            isOpen={this.state.isModalNewMultiOpen}
            onModalClose={this.onModalClose}
            title="제품 대량등록"
            method="products.insertmany"
          />
        )}
      </div>
    );
  }
}
