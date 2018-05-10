import React from 'react';
import moment from 'moment';

import { avoidWeekend } from '../../api/avoidWeekend';
import { exportCSV } from '../../api/exportCSV';
import { printDeliveryOrder } from '../../api/printDeliveryOrder';

import DatePicker from '../../custom/DatePicker/DatePicker';

export default class DeliveryPageHeaderButtons extends React.Component {
  /*=========================================================================
  >> props <<
  accountsData
  productsData
  ordersData
  deliveryData
  selectedDelivery
  onDeliveryDateChange
  ==========================================================================*/
  constructor(props) {
    super(props);

    const delivery = props.selectedDelivery;

    let hasOrdersList = false;
    if (delivery && delivery.orderList.length !== 0) {
      hasOrdersList = true;
    }

    this.state = {
      delivery,
      hasOrdersList,
      deliveryDate: avoidWeekend(moment())
    };

    this.onPrevClick = this.onPrevClick.bind(this);
    this.onNextClick = this.onNextClick.bind(this);
    this.onClickExportExcel = this.onClickExportExcel.bind(this);
    this.onPrintDeliveryOrderClick = this.onPrintDeliveryOrderClick.bind(this);
  }

  componentWillReceiveProps(props) {
    const delivery = props.selectedDelivery;

    let hasOrdersList = false;
    if (delivery && delivery.orderList.length !== 0) {
      hasOrdersList = true;
    }

    this.setState({ delivery, hasOrdersList });
  }

  onPrevClick() {
    let deliveryDate = this.state.deliveryDate;
    if (deliveryDate.day() === 1) {
      deliveryDate.subtract(3, 'days');
    } else {
      deliveryDate.subtract(1, 'days');
    }
    this.setState({ deliveryDate }, () => {
      this.onDateChange();
    });
  }

  onNextClick() {
    let deliveryDate = this.state.deliveryDate;
    if (deliveryDate.day() === 5) {
      deliveryDate.add(3, 'days');
    } else {
      deliveryDate.add(1, 'days');
    }
    this.setState({ deliveryDate }, () => {
      this.onDateChange();
    });
  }

  onDateChange() {
    this.props.onDeliveryDateChange(this.state.deliveryDate);
  }

  onClickExportExcel() {
    const filename = `광일_출고목록_${this.state.deliveryDate.format(
      'YYMMDD'
    )}.csv`;
    const delivery = this.state.delivery;
    const orders = [];
    const keys = [
      '_id',
      'orderedAt',
      'accountName', // AccountsData
      'productName', // ProductsData
      'productThick', // ProductsData
      'productLength', // ProductsData
      'productWidth', // ProductsData
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

    delivery.orderList.map(({ orderID }) => {
      orders.push(this.props.ordersData.find(order => order._id === orderID));
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

  onPrintDeliveryOrderClick() {
    printDeliveryOrder(this.state.deliveryDate.format('YYYY-MM-DD'));
  }

  render() {
    return (
      <div className="page-header__buttons">
        <button className="button button-cancel" onClick={this.onPrevClick}>
          <i className="fa fa-chevron-left fa-lg" />
        </button>

        <DatePicker
          id="deliveryDate"
          date={this.state.deliveryDate}
          onDateChange={deliveryDate => {
            if (deliveryDate === null) deliveryDate = moment();
            this.setState({ deliveryDate }, () => {
              this.onDateChange();
            });
          }}
          isOutsideRange={() => {
            return false;
          }}
          anchorDirection="right"
        />

        <button className="button button-cancel" onClick={this.onNextClick}>
          <i className="fa fa-chevron-right fa-lg" />
        </button>

        <button
          className="button button-with-icon-span page-header__button"
          onClick={this.onClickExportExcel}
          disabled={!this.state.hasOrdersList}
        >
          <i className="fa fa-table fa-lg" />
          <span>엑셀</span>
        </button>

        <button
          className="button button-with-icon-span page-header__button"
          onClick={this.onPrintDeliveryOrderClick}
          disabled={!this.state.hasOrdersList}
        >
          <i className="fa fa-print fa-lg" />
          <span>출력</span>
        </button>
      </div>
    );
  }
}
