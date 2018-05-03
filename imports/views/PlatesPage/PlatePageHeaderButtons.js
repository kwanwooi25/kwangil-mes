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
  queryObj
  =========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isModalNewOpen: false,
      isModalNewMultiOpen: false
    };

    this.onClickNew = this.onClickNew.bind(this);
    this.onClickNewMulti = this.onClickNewMulti.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
    this.onClickExportExcel = this.onClickExportExcel.bind(this);
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
    const filename = '광일_동판목록.csv';
    const queryObj = this.props.queryObj;

    // get plate list
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

    // filter data
    this.props.platesData.map(plate => {
      // store product names in an array
      const productNames = [];
      plate.forProductList.map(({ productID }) => {
        const product = this.props.productsData.find(
          product => product._id === productID
        );
        if (product) {
          productNames.push(product.name);
        } else {
          productNames.push('[삭제된 품목]');
        }
      });

      let matchProductNameQuery = false;
      let matchRoundQuery = false;
      let matchLengthQuery = false;
      let matchMaterialQuery = false;

      // return true if any of product names contain query text
      productNames.forEach(productName => {
        if (productName.indexOf(queryObj.productName) > -1) {
          matchProductNameQuery = true;
        }
      });

      if (String(plate.round).indexOf(queryObj.round) > -1) {
        matchRoundQuery = true;
      }

      if (String(plate.length).indexOf(queryObj.length) > -1) {
        matchLengthQuery = true;
      }

      if (queryObj.plateMaterial === 'both') {
        matchMaterialQuery = true;
      } else if (plate.material.indexOf(queryObj.plateMaterial) > -1) {
        matchMaterialQuery = true;
      }

      if (
        matchProductNameQuery &&
        matchRoundQuery &&
        matchLengthQuery &&
        matchMaterialQuery
      ) {
        plates.push(plate);
      }
    });

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
                      const product = this.props.productsData.find(
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
        {this.props.isAdmin ? (
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
        {this.props.isAdmin || this.props.isManager ? (
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
            isAdmin={this.props.isAdmin}
            isManager={this.props.isManager}
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
