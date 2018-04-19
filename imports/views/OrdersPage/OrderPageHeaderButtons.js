import React from 'react';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';

export default class OrderPageHeaderButtons extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onClickExportExcel = this.onClickExportExcel.bind(this);
  }

  onClickExportExcel() {
    const list = document.getElementById('order-list');
    const filename = '광일작업지시내역.csv';
    const slice = Array.prototype.slice;

    // get order list
    const lis = list.querySelectorAll('li');
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

    for (let i = 0; i < lis.length; i++) {
      orders.push(OrdersData.findOne({ _id: lis[i].id }));
    }

    // generate header csv
    let headerCSV =
      '발주ID,발주일,업체명,제품명,두께,길이,너비,주문량,동판,납기일,엄수,지급,작업참고,납품참고,완성수량,완료일,납품일';

    // generate body csv from account list
    const bodyCSV = orders
      .map(order => {
        const product = ProductsData.findOne({ _id: order.data.productID });
        const account = AccountsData.findOne({ _id: product.accountID });
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

    // function to generate download anchor
    const downloadAnchor = content => {
      const anchor = document.createElement('a');
      anchor.style = 'display:none !important';
      anchor.id = 'downloadanchor';
      document.body.appendChild(anchor);

      if ('download' in anchor) {
        anchor.download = filename;
      }
      anchor.href = content;
      anchor.click();
      anchor.remove();
    };

    // ** must add '\ueff' to prevent broken korean font
    const blob = new Blob(['\ufeff' + headerCSV + '\r\n' + bodyCSV], {
      type: 'text/csv;charset=utf-8;'
    });
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      downloadAnchor(URL.createObjectURL(blob));
    }
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
