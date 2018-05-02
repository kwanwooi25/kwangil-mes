import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { setLayout } from '../../api/setLayout';

import { OrdersData } from '../../api/orders';
import { ProductsData } from '../../api/products';
import { DeliveryData } from '../../api/delivery';

import Spinner from '../../custom/Spinner';
import ProductName from '../components/ProductName';

export default class DashboardPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ordersData: [],
      isDataReady: false
    };
  }

  componentDidMount() {
    // dynamically adjust height
    setLayout(30);
    window.addEventListener('resize', () => {
      setLayout(30);
    });

    // tracks data change
    this.databaseTracker = Tracker.autorun(() => {
      const productsSubscription = Meteor.subscribe('products');
      const ordersSubscription = Meteor.subscribe('orders');
      const deliverySubscription = Meteor.subscribe('delivery');
      const ordersData = OrdersData.find().fetch();
      const isDataReady =
        productsSubscription.ready() &&
        ordersSubscription.ready() &&
        deliverySubscription.ready();

      this.setState({ ordersData, isDataReady });
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
  }

  getOrdersSummary() {
    let incompleteCount = 0;
    let extrudingCount = 0;
    let printingCount = 0;
    let cuttingCount = 0;

    this.state.ordersData.map(order => {
      const { status } = order.data;

      if (status === 'extruding') {
        extrudingCount++;
      } else if (status === 'printing') {
        printingCount++;
      } else if (status === 'cutting') {
        cuttingCount++;
      }
    });

    incompleteCount = extrudingCount + printingCount + cuttingCount;

    return (
      <li className="dashboard-list-item incompleteOrders-container">
        <h3 className="dashboard-list-item__title">작업중 목록</h3>
        <div className="dashboard-list-item__content">
          <div className="dashboard-list-item__content-50">
            <p>
              <Link
                className="dashboard-list-item__large-number link"
                to="/orders"
              >
                {incompleteCount}
              </Link>
              <span>건</span>
            </p>
          </div>
          <div className="dashboard-list-item__content-50">
            <p>
              <span>압출중 </span>
              <a className="dashboard-list-item__small-number">
                {extrudingCount}
              </a>
              <span> 건</span>
            </p>
            <p>
              <span>인쇄중 </span>
              <a className="dashboard-list-item__small-number">
                {printingCount}
              </a>
              <span> 건</span>
            </p>
            <p>
              <span>가공중 </span>
              <a className="dashboard-list-item__small-number">
                {cuttingCount}
              </a>
              <span> 건</span>
            </p>
          </div>
        </div>
      </li>
    );
  }

  getNeedPlateSummary() {
    let needPlateCount = 0;
    let needPlateProducts = [];

    this.state.ordersData.map(order => {
      const { plateStatus, productID } = order.data;

      if (plateStatus === 'new' || plateStatus === 'edit') {
        needPlateCount++;
        needPlateProducts.push(productID);
      }
    });

    return (
      <li className="dashboard-list-item needPlateProducts-container">
        <h3 className="dashboard-list-item__title">동판 제작 필요 품목</h3>
        <div className="dashboard-list-item__content">
          <div className="dashboard-list-item__content-100">
            <p>
              <a className="dashboard-list-item__large-number">
                {needPlateCount}
              </a>
              <span>개 품목</span>
            </p>
          </div>
          <div className="dashboard-list-item__content-100">
            <ul className="needPlateProducts">
              {needPlateProducts.map(productID => {
                const product = ProductsData.findOne({ _id: productID });
                const productSize = ` ${product.thick}x${product.length}x${
                  product.width
                }`;
                return (
                  <li key={productID} className="needPlateProducts-list-item">
                    <ProductName
                      className="dashboard-list-item__productName"
                      productID={productID}
                      productName={product.name + productSize}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </li>
    );
  }

  getCompletedOrdersSummary() {
    let completedCount = 0;

    this.state.ordersData.map(order => {
      const { isCompleted, isDelivered } = order.data;

      if (isCompleted && !isDelivered) completedCount++;
    });

    return (
      <li className="dashboard-list-item completedOrders-container">
        <h3 className="dashboard-list-item__title">납품대기 목록</h3>
        <div className="dashboard-list-item__content">
          <div className="dashboard-list-item__content-100">
            <p>
              <Link
                className="dashboard-list-item__large-number link"
                to="/orders-completed"
              >
                {completedCount}
              </Link>
              건
            </p>
          </div>
        </div>
      </li>
    );
  }

  getDeliveryOrderSummary() {
    const today = moment().format('YYYY-MM-DD');
    let delivery;
    let directCount = 0;
    let postCount = 0;
    let etcCount = 0;

    delivery = DeliveryData.findOne({ _id: today });

    if (delivery) {
      delivery.orderList.map(({ deliverBy }) => {
        if (deliverBy === 'direct') {
          directCount++;
        } else if (deliverBy === 'post') {
          postCount++;
        } else {
          etcCount++;
        }
      });
    }

    return (
      <li className="dashboard-list-item deliveryOrders-container">
        <h3 className="dashboard-list-item__title">금일 출고건</h3>
        <div className="dashboard-list-item__content">
          <p className="dashboard-list-item__subtitle">
            <Link
              className="link"
              to="/delivery"
            >
              {moment().format('YYYY년 MM월 DD일')}
            </Link>
          </p>
          <div className="dashboard-list-item__content-100">
            <p>
              <span>직납 </span>
              <a className="dashboard-list-item__small-number">{directCount}</a>
              <span> 건</span>
            </p>
            <p>
              <span>택배 </span>
              <a className="dashboard-list-item__small-number">{postCount}</a>
              <span> 건</span>
            </p>
            <p>
              <span>기타 </span>
              <a className="dashboard-list-item__small-number">{etcCount}</a>
              <span> 건</span>
            </p>
          </div>
        </div>
      </li>
    );
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">광일프라스틱 생산관리</h1>
          </div>
        </div>

        <div className="page-content">
          <div className="list-container">
            <ul id="dashboard-list" className="list">
              {this.state.isDataReady ? this.getOrdersSummary() : <Spinner />}

              {this.state.isDataReady ? (
                this.getCompletedOrdersSummary()
              ) : (
                <Spinner />
              )}

              {this.state.isDataReady ? (
                this.getDeliveryOrderSummary()
              ) : (
                <Spinner />
              )}

              {this.state.isDataReady ? (
                this.getNeedPlateSummary()
              ) : (
                <Spinner />
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
