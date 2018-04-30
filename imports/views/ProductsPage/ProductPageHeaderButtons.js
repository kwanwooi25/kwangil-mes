import React from 'react';

import { exportCSV } from '../../api/exportCSV';

import ProductModal from './ProductModal';
import AddNewMultiModal from '../components/AddNewMultiModal';

export default class ProductPageHeaderButtons extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  productsData
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      productsData: props.productsData,
      isModalNewOpen: false,
      isModalNewMultiOpen: false
    };

    this.onClickNew = this.onClickNew.bind(this);
    this.onClickNewMulti = this.onClickNewMulti.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
    this.onClickExportExcel = this.onClickExportExcel.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      productsData: props.productsData
    });
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
    const list = document.getElementById('product-list');
    const filename = '광일_제품목록.csv';
    const slice = Array.prototype.slice;

    // get account list
    const lis = list.querySelectorAll('li');
    const products = [];
    const keys = [
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
      'utUltrasonic',
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

    for (let i = 0; i < lis.length; i++) {
      products.push(
        this.state.productsData.find(product => product._id === lis[i].id)
      );
    }

    // generate header csv
    let headerCSV =
      '업체ID,업체명,제품ID,제품명,두께,길이,너비,무지_인쇄,원단색상,대전방지,처리,압출메모,도안URL,전면도수,전면색상,전면위치,후면도수,후면색상,후면위치,인쇄메모,가공위치,초음파가공,가루포장,바람구멍,바람구멍개수,바람구멍크기,바람구멍위치,가공메모,포장방법,포장수량,전량납품,포장메모,재고수량';

    // for managers
    if (this.state.isAdmin || this.state.isManager) {
      keys.push(['price', 'history', 'memo']);
      headerCSV += ',가격,작업이력,메모';
    }

    // generate body csv from account list
    const bodyCSV = products
      .map(product => {
        return keys
          .map(key => {
            if (product[key] === undefined) {
              return '""';
            } else {
              return '"t"'.replace('t', product[key]);
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
        >
          <i className="fa fa-table fa-lg" />
          <span>엑셀</span>
        </button>
        {this.state.isAdmin && (
          <button
            className="button button-with-icon-span page-header__button"
            onClick={this.onClickNewMulti}
          >
            <i className="fa fa-plus-square fa-lg" />
            <span>대량등록</span>
          </button>
        )}
        {(this.state.isAdmin || this.state.isManager) && (
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
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
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
