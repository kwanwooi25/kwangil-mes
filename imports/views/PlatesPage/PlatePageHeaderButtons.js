import React from 'react';

import { exportCSV } from '../../api/exportCSV';

import PlateModal from './PlateModal';
import AddNewMultiModal from '../components/AddNewMultiModal';

export default class PlatePageHeaderButtons extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  productsData
  platesData
  =========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      productsData: props.productsData,
      platesData: props.platesData,
      isModalNewOpen: false
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
      productsData: props.productsData,
      platesData: props.platesData
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
    const list = document.getElementById('plate-list');
    const filename = '광일_동판목록.csv';
    const slice = Array.prototype.slice;

    // get plate list
    const lis = list.querySelectorAll('li');
    const plates = [];
    const keys = [
      '_id',
      'round',
      'length',
      'material',
      'location',
      'forProductList',
      'history',
      'memo'
    ];

    for (let i = 0; i < lis.length; i++) {
      plates.push(this.state.platesData.find(plate => plate._id === lis[i].id));
    }

    // generate header csv
    let headerCSV = '동판ID,둘레,기장,구분,위치,사용품목,이력,메모';

    // generate body csv from plate list
    const bodyCSV = plates
      .map(plate => {
        return keys
          .map(key => {
            if (plate[key] === undefined) {
              return '""';
            } else {

              // change array into text for product list
              if (key === 'forProductList') {
                return '"t"'.replace(
                  't',
                  plate[key]
                    .map(({ productID, printContent }) => {
                      const product = this.state.productsData.find(
                        product => product._id === productID
                      );
                      let productInfoText = '';
                      if (product) {
                        productInfoText = `${product.name} (${product.thick}x${product.length}x${product.width}) ${printContent}`;
                      } else {
                        productInfoText = '[삭제된 품목]';
                      }

                      return productInfoText;
                    })
                    .join(' / ')
                );

              // change array into text for history
              } else if (key === 'history') {
                return '"t"'.replace(
                  't',
                  plate[key].map(({ date, memo }) => {
                    return `${date}: ${memo}`;
                  }).join(' / ')
                )

              // return plain text for the rest
              } else {
                return '"t"'.replace('t', plate[key]);
              }
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
        {this.state.isAdmin ? (
          <button
            className="button button-with-icon-span page-header__button"
            onClick={this.onClickNewMulti}
          >
            <i className="fa fa-plus-square fa-lg" />
            <span>대량등록</span>
          </button>
        ) : (
          undefined
        )}
        {this.state.isAdmin || this.state.isManager ? (
          <button
            className="button button-with-icon-span page-header__button"
            onClick={this.onClickNew}
          >
            <i className="fa fa-plus fa-lg" />
            <span>신규</span>
          </button>
        ) : (
          undefined
        )}

        {this.state.isModalNewOpen && (
          <PlateModal
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
            title="동판 대량등록"
            method="plates.insertmany"
          />
        )}
      </div>
    );
  }
}
