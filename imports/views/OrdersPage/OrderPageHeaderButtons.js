import React from 'react';
import moment from 'moment';

import { exportCSV } from '../../api/exportCSV';

export default class OrderPageHeaderButtons extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  accountsData
  productsData
  ordersData
  queryObj
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onClickExportExcel = this.onClickExportExcel.bind(this);
  }

  onClickExportExcel() {
    const filename = '광일_작업지시내역.csv';
    const queryObj = this.props.queryObj;

    // get order list
    const orders = [];
    const keys = [
      '_id',
      'orderedAt',
      'accountName',   // AccountsData
      'productName',   // ProductsData
      'productThick',  // ProductsData
      'productLength', // ProductsData
      'productWidth',  // ProductsData
      'orderQuantity',
      'orderQuantityInWeight',
      'plateStatus',
      'deliverBefore',
      'deliverDateStrict',
      'deliverFast',
      'workMemo',
      'deliverMemo',
      'completedQuantity',
      'completedAt',
      'deliveredAt'
    ];

    this.props.ordersData.map(order => {
      const product = this.props.productsData.find(
        product => product._id === order.data.productID
      );
      let account;
      if (product) {
        account = this.props.accountsData.find(
          account => account._id === product.accountID
        );
      }

      let dateRangeMatch = false;
      let accountNameMatch = false;
      let productNameMatch = false;
      let isPrintMatch = false;
      let showCompletedMatch = false;

      const orderedAt = moment(order.data.orderedAt);
      const searchFrom = moment(queryObj.searchFrom);
      const searchTo = moment(queryObj.searchTo);

      if (searchFrom <= orderedAt && orderedAt <= searchTo) {
        dateRangeMatch = true;
      }

      if (account && account.name.indexOf(queryObj.accountName) > -1) {
        accountNameMatch = true;
      }

      if (product && product.name.indexOf(queryObj.productName) > -1) {
        productNameMatch = true;
      }

      if (
        queryObj.isPrintQuery === 'both' ||
        (queryObj.isPrintQuery === 'false' && !product.isPrint) ||
        (queryObj.isPrintQuery === 'true' && product.isPrint)
      ) {
        isPrintMatch = true;
      }

      if (!order.data.isCompleted ||
        (order.data.isCompleted && queryObj.showCompletedOrder)) {
        showCompletedMatch = true;
      }

      if (
        dateRangeMatch &&
        accountNameMatch &&
        productNameMatch &&
        isPrintMatch &&
        showCompletedMatch
      ) {
        orders.push(order);
      }
    });

    // generate header csv
    let headerCSV =
      '발주ID,발주일,업체명,제품명,두께,길이,너비,주문량,주문중량,동판,납기일,엄수,지급,작업참고,납품참고,완성수량,완료일,납품일';

    // generate body csv from account list
    const bodyCSV = orders
      .map(order => {
        const product = this.props.productsData.find(
          product => product._id === order.data.productID
        );
        const account = this.props.accountsData.find(
          account => account._id === product.accountID
        );
        const orderQuantityInWeight = Number(product.thick) * (Number(product.length) + 5) * (Number(product.width)/100) * 0.0184 * Number(order.data.orderQuantity);
        return keys
          .map(key => {
            switch (key) {
              case '_id':
                return '"t"'.replace('t', order._id);
              case 'accountName':
                return '"t"'.replace('t', account.name);
              case 'productName':
                return '"t"'.replace('t', product.name);
              case 'productThick':
                return '"t"'.replace('t', product.thick);
              case 'productLength':
                return '"t"'.replace('t', product.length);
              case 'productWidth':
                return '"t"'.replace('t', product.width);
              case 'orderQuantityInWeight':
                return '"t"'.replace('t', orderQuantityInWeight);
              case order.data[key] === undefined:
                return '""';
              default:
                return '"t"'.replace('t', order.data[key]);
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
      </div>
    );
  }
}
