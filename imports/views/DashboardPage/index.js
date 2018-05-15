import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { setLayout } from '../../api/setLayout';

import Spinner from '../../custom/Spinner';
import ProductName from '../components/ProductName';

export default class DashboardPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOrdersCountReady: false,
      completedOrdersCount: 0,
      isDeliveryOrderSummaryReady: false,
      isNeedPlateSummaryReady: false
    };
  }

  componentDidMount() {
    // dynamically adjust height
    setLayout(30);
    window.addEventListener('resize', () => {
      setLayout(30);
    });

    // get orders count
    Meteor.call('dashboard.getOrdersCount', (err, res) => {
      if (res) {
        this.setState({
          isOrdersCountReady: true,
          ordersCount: res
        });
      }
    });

    // get completed orders count
    Meteor.call('dashboard.getCompletedOrdersCount', (err, res) => {
      if (res) this.setState({ completedOrdersCount: res });
    });

    // get delivery order summary
    Meteor.call(
      'dashboard.getDeliveryOrderCounts',
      moment().format('YYYY-MM-DD'),
      (err, res) => {
        if (res) {
          this.setState({
            deliveryOrderCounts: res,
            isDeliveryOrderSummaryReady: true
          });
        }
      }
    );

    // get need plate summary
    Meteor.call('dashboard.getNeedPlateCounts', (err, res) => {
      if (res) {
        this.setState({
          needPlates: res,
          isNeedPlateSummaryReady: true
        });
      }
    });
  }

  render() {
    const ordersCount = this.state.ordersCount;
    const deliveryOrderCounts = this.state.deliveryOrderCounts;
    const needPlates = this.state.needPlates;
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
              <li className="dashboard-list-item incompleteOrders-container">
                <h3 className="dashboard-list-item__title">작업중 목록</h3>
                {this.state.isOrdersCountReady ? (
                  <div className="dashboard-list-item__content">
                    <div className="dashboard-list-item__content-50">
                      <p>
                        <Link
                          className="dashboard-list-item__large-number link"
                          to="/orders"
                        >
                          {ordersCount.incompleteCount}
                        </Link>
                        <span>건</span>
                      </p>
                    </div>
                    <div className="dashboard-list-item__content-50">
                      <p>
                        <span>압출중 </span>
                        <a className="dashboard-list-item__small-number">
                          {ordersCount.extrudingCount}
                        </a>
                        <span> 건</span>
                      </p>
                      <p>
                        <span>인쇄중 </span>
                        <a className="dashboard-list-item__small-number">
                          {ordersCount.printingCount}
                        </a>
                        <span> 건</span>
                      </p>
                      <p>
                        <span>가공중 </span>
                        <a className="dashboard-list-item__small-number">
                          {ordersCount.cuttingCount}
                        </a>
                        <span> 건</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <Spinner />
                )}
              </li>

              <li className="dashboard-list-item completedOrders-container">
                <h3 className="dashboard-list-item__title">납품대기 목록</h3>
                <div className="dashboard-list-item__content">
                  <div className="dashboard-list-item__content-100">
                    {this.state.completedOrdersCount ? (
                      <p>
                        <Link
                          className="dashboard-list-item__large-number link"
                          to="/orders-completed"
                        >
                          {this.state.completedOrdersCount}
                        </Link>
                        건
                      </p>
                    ) : (
                      <Spinner />
                    )}
                  </div>
                </div>
              </li>

              <li className="dashboard-list-item deliveryOrders-container">
                <h3 className="dashboard-list-item__title">금일 출고건</h3>
                <div className="dashboard-list-item__content">
                  <p className="dashboard-list-item__subtitle">
                    <Link className="link" to="/delivery">
                      {moment().format('YYYY. MM. DD (ddd)')}
                    </Link>
                  </p>
                  {this.state.isDeliveryOrderSummaryReady ? (
                    <div className="dashboard-list-item__content-100">
                      <p>
                        <span>직납 </span>
                        <a className="dashboard-list-item__small-number">
                          {deliveryOrderCounts.directCount}
                        </a>
                        <span> 건</span>
                      </p>
                      <p>
                        <span>택배 </span>
                        <a className="dashboard-list-item__small-number">
                          {deliveryOrderCounts.postCount}
                        </a>
                        <span> 건</span>
                      </p>
                      <p>
                        <span>기타 </span>
                        <a className="dashboard-list-item__small-number">
                          {deliveryOrderCounts.etcCount}
                        </a>
                        <span> 건</span>
                      </p>
                    </div>
                  ) : (
                    <Spinner />
                  )}
                </div>
              </li>

              <li className="dashboard-list-item needPlateProducts-container">
                <h3 className="dashboard-list-item__title">
                  동판 제작 필요 품목
                </h3>
                <div className="dashboard-list-item__content">
                  {this.state.isNeedPlateSummaryReady ? (
                    <div className="dashboard-list-item__content-100">
                      <p>
                        <a className="dashboard-list-item__large-number">
                          {needPlates.needPlateCount}
                        </a>
                        <span>개 품목</span>
                      </p>
                      <ul className="needPlateProducts">
                        {needPlates.productNameList.map(
                          ({ productID, productName }, index) => {
                            return (
                              <li
                                key={productID}
                                className="needPlateProducts-list-item"
                              >
                                <ProductName
                                  className="dashboard-list-item__productName"
                                  productID={productID}
                                  productName={productName}
                                />
                                <span>
                                  {needPlates.plateStatusArray[index]}
                                </span>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    </div>
                  ) : (
                    <Spinner />
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
