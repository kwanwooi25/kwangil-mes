import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { setLayout } from '../../api/setLayout';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';
import { DeliveryData } from '../../api/delivery';

import Spinner from '../../custom/Spinner';
import ProductName from '../components/ProductName';

export default class DashboardPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDataReady: false,
      productsData: [],
      ordersData: [],
      deliveryData: []
    };
  }

  componentDidMount() {
    // dynamically adjust height
    setLayout(30);
    window.addEventListener('resize', () => {
      setLayout(30);
    });

    // subscribe to data
    subsCache = new SubsCache(-1, -1);
    subsCache.subscribe('products');
    subsCache.subscribe('orders');
    subsCache.subscribe('delivery');

    this.tracker = Tracker.autorun(() => {
      const isDataReady = subsCache.ready();
      const productsData = ProductsData.find().fetch();
      const ordersData = OrdersData.find().fetch();
      const deliveryData = DeliveryData.find().fetch();

      this.setState({ isDataReady, productsData, ordersData, deliveryData });
    });
  }

  componentWillUnmount() {
    this.tracker.stop();
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
    let needPlateStatusArray = [];

    this.state.ordersData.map(order => {
      const { plateStatus, productID, isCompleted } = order.data;

      if (!isCompleted && (plateStatus === 'new' || plateStatus === 'edit')) {
        needPlateCount++;
        needPlateProducts.push(productID);
        const needPlateStatus =
          plateStatus === 'new'
            ? '(신규)'
            : plateStatus === 'edit' ? '(수정)' : '';
        needPlateStatusArray.push(needPlateStatus);
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
              {needPlateProducts.map((productID, index) => {
                const product = this.state.productsData.find(
                  product => product._id === productID
                );
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
                    <span>{needPlateStatusArray[index]}</span>
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
      const { isCompleted, isDelivered, deliveredAt } = order.data;

      if (isCompleted && !deliveredAt && !isDelivered) completedCount++;
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

    delivery = this.state.deliveryData.find(delivery => delivery._id === today);

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
            <Link className="link" to="/delivery">
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
              {!this.state.isDataReady && <Spinner />}
              {this.state.isDataReady && this.getOrdersSummary()}
              {this.state.isDataReady && this.getCompletedOrdersSummary()}
              {this.state.isDataReady && this.getDeliveryOrderSummary()}
              {this.state.isDataReady && this.getNeedPlateSummary()}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
