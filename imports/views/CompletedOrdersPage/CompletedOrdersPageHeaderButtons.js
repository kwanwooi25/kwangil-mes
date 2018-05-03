import React from 'react';

import { exportCSV } from '../../api/exportCSV';

export default class CompletedOrdersPageHeaderButtons extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  accountsData
  productsData
  ordersData
  query
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onClickExportExcel = this.onClickExportExcel.bind(this);
  }

  onClickExportExcel() {
    const filename = '광일_납품대기목록.csv';
    const query = this.props.query;

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

    this.props.ordersData
      .sort((a, b) => {
        const a_deliverBefore = a.data.deliverBefore;
        const b_deliverBefore = b.data.deliverBefore;
        if (a_deliverBefore > b_deliverBefore) return 1;
        if (a_deliverBefore < b_deliverBefore) return -1;
        return 0;
      })
      .map(order => {
        const product = this.props.productsData.find(
          product => product._id === order.data.productID
        );
        let account;
        if (product) {
          account = this.props.accountsData.find(
            account => account._id === product.accountID
          );
        }

        let matchQuery = false;

        if (
          (account && account.name.indexOf(query) > -1 ||
            product && product.name.indexOf(query) > -1) &&
          order.data.isCompleted &&
          !order.data.isDelivered
        ) {
          matchQuery = true;
        }

        if (matchQuery) {
          orders.push(order);
        }
      });

    // generate header csv
    let headerCSV =
      '발주ID,발주일,업체명,제품명,두께,길이,너비,주문량,동판,납기일,엄수,지급,작업참고,납품참고,완성수량,완료일,납품일';

    // generate body csv from account list
    const bodyCSV = orders
      .map(order => {
        const product = this.props.productsData.find(
          product => product._id === order.data.productID
        );
        const account = this.props.accountsData.find(
          account => account._id === product.accountID
        );
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
