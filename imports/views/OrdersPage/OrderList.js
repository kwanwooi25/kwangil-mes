import React from 'react';
import moment from 'moment';
import 'pdfmake/build/pdfmake.js';
import 'pdfmake/build/vfs_fonts.js';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';

import Checkbox from '../../custom/Checkbox';
import ProductOrderModal from '../ProductsPage/ProductOrderModal';
import ProductDetailView from '../ProductsPage/ProductDetailView';
import CompleteOrderModal from './CompleteOrderModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class OrderList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter account list
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      accountList: [],
      productList: [],
      data: [],
      queryObj: props.queryObj,
      isAdmin: false,
      isManager: false,
      isPrintOrderModalOpen: false,
      isCompleteOrderModalOpen: false,
      isProductOrderModalOpen: false,
      isProductDetailViewOpen: false,
      isDeleteConfirmModalOpen: false,
      selectedOrderID: '',
      selectedOrderDetail: '',
      ordersCount: 0
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onStatusChange = this.onStatusChange.bind(this);
    this.onProductNameClick = this.onProductNameClick.bind(this);
    this.onProductDetailViewClose = this.onProductDetailViewClose.bind(this);
    this.onPrintOrderClick = this.onPrintOrderClick.bind(this);
    this.onCompleteOrderClick = this.onCompleteOrderClick.bind(this);
    this.onCompleteOrderModalClose = this.onCompleteOrderModalClose.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onProductOrderModalClose = this.onProductOrderModalClose.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onDeleteConfirmModalClose = this.onDeleteConfirmModalClose.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({ queryObj: props.queryObj });
  }

  componentDidMount() {
    // tracks data change
    this.databaseTracker = Tracker.autorun(() => {
      Meteor.subscribe('accounts');
      Meteor.subscribe('products');
      Meteor.subscribe('orders');
      const accountList = AccountsData.find(
        {},
        { fields: { _id: 1, name: 1 } }
      ).fetch();
      const productList = ProductsData.find(
        {},
        {
          fields: {
            _id: 1,
            accountID: 1,
            name: 1,
            thick: 1,
            length: 1,
            width: 1,
            isPrint: 1
          }
        }
      ).fetch();
      const orderList = OrdersData.find({}, { sort: { _id: 1 } }).fetch();

      this.setState({
        accountList,
        productList,
        data: orderList,
        ordersCount: orderList.length
      });
    });

    // tracks if the user logged in is admin or manager
    this.authTracker = Tracker.autorun(() => {
      if (Meteor.user()) {
        this.setState({
          isAdmin: Meteor.user().profile.isAdmin,
          isManager: Meteor.user().profile.isManager
        });
      }
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
    this.authTracker.stop();
  }

  comma(str) {
    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
  }

  uncomma(str) {
    str = String(str);
    return str.replace(/[^\d]+/g, '');
  }

  onInputChange(e) {
    if (e.target.name === 'selectAll') {
      const checkboxes = document.querySelectorAll(
        '#order-list input[type="checkbox"]'
      );

      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = e.target.checked;
      }
    }
  }

  onStatusChange(e) {
    const targetID = e.target.parentNode.parentNode.parentNode.id;
    const statusValue = e.target.value;
    const order = this.state.data.find(order => order._id === targetID);
    let data = order.data;
    data.status = statusValue;

    Meteor.call('orders.update', targetID, data, (err, res) => {
      if (!err) {
        console.log('status updated');
      } else {
        this.setState({ error: err.error });
      }
    });
  }

  // show detail view modal
  onProductNameClick(e) {
    this.setState({
      isProductDetailViewOpen: true,
      selectedProductID: e.target.parentNode.parentNode.classList[0]
    });
  }

  onProductDetailViewClose() {
    this.setState({ isProductDetailViewOpen: false, selectedProductID: '' });
  }

  // show print order modal
  onPrintOrderClick(e) {
    let selectedOrderID = '';
    if (e.target.tagName === 'SPAN') {
      selectedOrderID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'BUTTON') {
      selectedOrderID = e.target.parentNode.parentNode.parentNode.id;
    }

    const selectedOrder = OrdersData.findOne({ _id: selectedOrderID });
    const selectedProduct = ProductsData.findOne({ _id: selectedOrder.data.productID})

    /*==========================================================
    to use custom fonts, follow the steps below
    1. create folder: pdfmake/examples/fonts
    2. copy fonts in the folder
    3. go to root directory of 'pdfmake' package
    4. run 'npm install'
    5. run 'gulp buildFonts'
    ==========================================================*/

    pdfMake.fonts = {
      NanumGothic: {
        normal: 'NanumGothic-Regular.ttf',
        bold: 'NanumGothic-Bold.ttf',
        italics: 'NanumGothic-Regular.ttf',
        bolditalics: 'NanumGothic-Bold.ttf'
      }
    };

    const docDefinition = {
      content: [
        { text: `making pdf file for order: ${selectedOrderID}` },
        { text: `productName: ${selectedProduct.name}` }
      ],
      defaultStyle: {
        font: 'NanumGothic'
      }
    }

    pdfMake.createPdf(docDefinition).open();
  }

  // show order complete modal
  onCompleteOrderClick(e) {
    let selectedOrderID = '';
    if (e.target.tagName === 'SPAN') {
      selectedOrderID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'BUTTON') {
      selectedOrderID = e.target.parentNode.parentNode.parentNode.id;
    }

    this.setState({
      isCompleteOrderModalOpen: true,
      selectedOrderID
    });
  }

  onCompleteOrderModalClose() {
    this.setState({ isCompleteOrderModalOpen: false, selectedOrderID: '' });
  }

  // show product order modal (EDIT mode)
  onEditClick(e) {
    let selectedOrderID = '';
    if (e.target.tagName === 'SPAN') {
      selectedOrderID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'BUTTON') {
      selectedOrderID = e.target.parentNode.parentNode.parentNode.id;
    }

    this.setState({
      isProductOrderModalOpen: true,
      selectedOrderID
    });
  }

  onProductOrderModalClose() {
    this.setState({ isProductOrderModalOpen: false, selectedOrderID: '' });
  }

  // show confirmation modal before delete
  onDeleteClick(e) {
    let selectedOrderID = '';
    let selectedOrderDetail = '';
    let productID = '';
    let orderData = {};
    let product = {};
    if (e.target.tagName === 'SPAN') {
      selectedOrderID = e.target.parentNode.parentNode.parentNode.parentNode.id;
      productID = e.target.parentNode.parentNode.parentNode.parentNode.querySelector(
        '.order-product-details-container'
      ).classList[0];
      orderData = OrdersData.findOne({ _id: selectedOrderID }).data;
      product = ProductsData.findOne({ _id: productID });
    } else if (e.target.tagName === 'BUTTON') {
      selectedOrderID = e.target.parentNode.parentNode.parentNode.id;
      productID = e.target.parentNode.parentNode.parentNode.querySelector(
        '.order-product-details-container'
      ).classList[0];
      orderData = OrdersData.findOne({ _id: selectedOrderID }).data;
      product = ProductsData.findOne({ _id: productID });
    }

    selectedOrderDetail = `
      [ ${product.name} :
      ${product.thick} x
      ${product.length} x
      ${product.width} =
      ${this.comma(orderData.orderQuantity)}매 ]
      작업지시 취소하시겠습니까?
    `;

    this.setState({
      isDeleteConfirmModalOpen: true,
      selectedOrderID,
      selectedOrderDetail
    });
  }

  onDeleteConfirmModalClose(answer) {
    this.setState({ isDeleteConfirmModalOpen: false });

    if (answer) {
      Meteor.call('orders.remove', this.state.selectedOrderID);
    }
  }

  getOrderList(queryObj) {
    return this.state.data.map(({ _id, data }) => {
      const order = data;
      const product = this.state.productList.find(
        product => product._id === order.productID
      );
      const account = this.state.accountList.find(
        account => account._id === product.accountID
      );

      let listClassName = 'order';
      if (order.isCompleted) {
        listClassName += ' completed';
      }

      let isPrintText = '무지';
      if (product.isPrint) {
        isPrintText = '인쇄';
        switch (order.plateStatus) {
          case 'confirm':
            isPrintText += ' (동판확인)';
            break;
          case 'new':
            isPrintText += ' (동판신규)';
            break;
          case 'edit':
            isPrintText += ' (동판수정)';
            break;
        }
      }

      const weight =
        Number(product.thick) *
        (Number(product.length) + 5) *
        Number(product.width) /
        100 *
        0.0184 *
        Number(data.orderQuantity);

      let matchQuery = false;

      const orderedAt = moment(order.orderedAt);
      const searchFrom = moment(queryObj.searchFrom);
      const searchTo = moment(queryObj.searchTo);

      if (
        searchFrom <= orderedAt &&
        orderedAt <= searchTo &&
        account.name.indexOf(queryObj.accountName) > -1 &&
        product.name.indexOf(queryObj.productName) > -1
      ) {
        if (!data.isCompleted) {
          if (queryObj.isPrintQuery === 'both') {
            matchQuery = true;
          }
          if (queryObj.isPrintQuery === 'false' && !product.isPrint) {
            matchQuery = true;
          }
          if (queryObj.isPrintQuery === 'true' && product.isPrint) {
            matchQuery = true;
          }
        } else {
          if (queryObj.showCompletedOrder) {
            if (queryObj.isPrintQuery === 'both') {
              matchQuery = true;
            }
            if (queryObj.isPrintQuery === 'false' && !product.isPrint) {
              matchQuery = true;
            }
            if (queryObj.isPrintQuery === 'true' && product.isPrint) {
              matchQuery = true;
            }
          }
        }
      }

      // only show product that has matching query text
      if (matchQuery) {
        return (
          <li className={listClassName} key={_id} id={_id}>
            <div className="order-checkbox-container">
              <Checkbox name={_id} onInputChange={this.onInputChange} />
            </div>

            <div className="order-container">
              <div className="order-deliver-remark-container">
                {order.deliverFast ? (
                  <span className="order-list__text">
                    <i className="fa fa-star" /> 지급
                  </span>
                ) : (
                  undefined
                )}
                {order.deliverDateStrict ? (
                  <span className="order-list__text">
                    <i className="fa fa-star" /> 납기엄수
                  </span>
                ) : (
                  undefined
                )}
              </div>

              <div className="order-id-container">
                <p className="order-list__text">{_id}</p>
              </div>

              <div className="order-dates-container">
                <p className="order-list__text">발주일: {order.orderedAt}</p>
                <p className="order-list__text">
                  납기일: {order.deliverBefore}
                </p>
              </div>

              <div className={product._id + ' order-product-details-container'}>
                <div className="order-names-container">
                  <a className="order-list__subtitle">{account.name}</a>
                  <a
                    className="order-list__title"
                    onClick={this.onProductNameClick}
                  >
                    {product.name}
                  </a>
                </div>
                <div className="order-product-size-container">
                  <span className="order-list__text">{product.thick}</span>
                  <i className="fa fa-times" />
                  <span className="order-list__text">{product.length}</span>
                  <i className="fa fa-times" />
                  <span className="order-list__text">{product.width}</span>
                </div>
                <div className="order-product-isPrint-container">
                  <p className="order-list__text">{isPrintText}</p>
                </div>
                <div className="order-orderQuantity-container">
                  <p className="order-list__text">
                    {this.comma(order.orderQuantity) +
                      '매 (' +
                      this.comma(weight.toFixed(0)) +
                    'kg)'}
                  </p>
                </div>
              </div>

              <div className="order-status-select-container">
                <select
                  className="select order-list__select"
                  value={order.isCompleted ? '완료' : order.status}
                  onChange={this.onStatusChange}
                  disabled={order.isCompleted}
                >
                  <option value="extruding">압출중</option>
                  <option value="printing" disabled={!product.isPrint}>인쇄중</option>
                  <option value="cutting">가공중</option>
                </select>
              </div>

              {this.state.isAdmin || this.state.isManager ? (
                <div className="order-buttons-container">
                  <button
                    className="button-circle order-button"
                    onClick={this.onPrintOrderClick}
                    disabled={order.isCompleted}
                  >
                    <i className="fa fa-print fa-lg"></i>
                    <span>출력</span>
                  </button>
                  <button
                    className="button-circle order-button"
                    onClick={this.onCompleteOrderClick}
                    disabled={order.isCompleted}
                  >
                    <i className="fa fa-check fa-lg" />
                    <span>완료</span>
                  </button>
                  <button
                    className="button-circle order-button"
                    onClick={this.onEditClick}
                    disabled={order.isCompleted}
                  >
                    <i className="fa fa-edit fa-lg" />
                    <span>수정</span>
                  </button>
                  <button
                    className="button-circle order-button"
                    onClick={this.onDeleteClick}
                    disabled={order.isCompleted}
                  >
                    <i className="fa fa-trash fa-lg" />
                    <span>삭제</span>
                  </button>
                </div>
              ) : (
                undefined
              )}
            </div>
          </li>
        );
      }
    });
  }

  render() {
    return (
      <ul id="order-list">
        {this.state.ordersCount &&
        (this.state.isAdmin || this.state.isManager) ? (
          <div className="order-select-all">
            <Checkbox
              name="selectAll"
              label="전체선택"
              onInputChange={this.onInputChange}
            />
          </div>
        ) : (
          undefined
        )}

        {this.getOrderList(this.state.queryObj)}
        {this.state.isProductOrderModalOpen ? (
          <ProductOrderModal
            isOpen={this.state.isProductOrderModalOpen}
            orderID={this.state.selectedOrderID}
            onModalClose={this.onProductOrderModalClose}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        ) : (
          undefined
        )}
        {this.state.isProductDetailViewOpen ? (
          <ProductDetailView
            isOpen={this.state.isProductDetailViewOpen}
            productID={this.state.selectedProductID}
            onDetailViewClose={this.onProductDetailViewClose}
          />
        ) : (
          undefined
        )}
        {this.state.isCompleteOrderModalOpen ? (
          <CompleteOrderModal
            isOpen={this.state.isCompleteOrderModalOpen}
            orderID={this.state.selectedOrderID}
            onModalClose={this.onCompleteOrderModalClose}
          />
        ) : (
          undefined
        )}
        {this.state.isDeleteConfirmModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmModalOpen}
            title="작업지시 취소"
            description={this.state.selectedOrderDetail}
            onModalClose={this.onDeleteConfirmModalClose}
          />
        ) : (
          undefined
        )}
      </ul>
    );
  }
}
