import React from 'react';
import moment from 'moment';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { OrdersData } from '../../api/orders';
import { comma } from '../../api/comma';

import OrderListHeader from './OrderListHeader';
import OrderListItem from './OrderListItem';
import AccountDetailView from '../AccountsPage/AccountDetailView';
import ProductDetailView from '../ProductsPage/ProductDetailView';
import OrderDetailView from './OrderDetailView';
import ProductOrderModal from '../ProductsPage/ProductOrderModal';
import CompleteOrderModal from './CompleteOrderModal';
import CompleteMultiOrderModal from './CompleteMultiOrderModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class OrderList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter account list
  isAdmin
  isManager
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      accountList: [],
      productList: [],
      ordersData: [],
      queryObj: props.queryObj,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      isAccountDetailViewOpen: false,
      isProductDetailViewOpen: false,
      isOrderDetailViewOpen: false,
      isCompleteOrderModalOpen: false,
      isProductOrderModalOpen: false,
      isDeleteConfirmationModalOpen: false,
      isCompleteMultiOrderModalOpen: false,
      selectedAccountID: '',
      selectedProductID: '',
      selectedOrderID: '',
      selectedOrders: [],
      confirmationDescription: [],
      ordersCount: 0,
      isSelectedMulti: false,
      selectedOrders: []
    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.showAccountDetailView = this.showAccountDetailView.bind(this);
    this.hideAccountDetailView = this.hideAccountDetailView.bind(this);
    this.showProductDetailView = this.showProductDetailView.bind(this);
    this.hideProductDetailView = this.hideProductDetailView.bind(this);
    this.showOrderDetailView = this.showOrderDetailView.bind(this);
    this.hideOrderDetailView = this.hideOrderDetailView.bind(this);
    this.updateOrderStatus = this.updateOrderStatus.bind(this);
    this.showCompleteOrderModal = this.showCompleteOrderModal.bind(this);
    this.hideCompleteOrderModal = this.hideCompleteOrderModal.bind(this);
    this.showProductOrderModal = this.showProductOrderModal.bind(this);
    this.hideProductOrderModal = this.hideProductOrderModal.bind(this);
    this.showDeleteConfirmationModal = this.showDeleteConfirmationModal.bind(
      this
    );
    this.hideDeleteConfirmationModal = this.hideDeleteConfirmationModal.bind(
      this
    );
    this.showCompleteMultiOrderModal = this.showCompleteMultiOrderModal.bind(
      this
    );
    this.hideCompleteMultiOrderModal = this.hideCompleteMultiOrderModal.bind(
      this
    );
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      queryObj: props.queryObj,
      isAdmin: props.isAdmin,
      isManager: props.isManage
    });
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
        ordersData: orderList,
        ordersCount: orderList.length
      });
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
  }

  onCheckboxChange(e) {
    let selectedOrders = this.state.selectedOrders;
    if (e.target.name === 'selectAll') {
      selectedOrders = [];
      const checkboxes = document.querySelectorAll(
        '#order-list input[type="checkbox"]'
      );

      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = e.target.checked;
        if (e.target.checked) {
          selectedOrders.push(checkboxes[i].name);
        }
      }
    } else {
      selectedOrders = selectedOrders.filter(value => value !== e.target.name);
      if (e.target.checked) {
        selectedOrders.push(e.target.name);
      }
    }
    selectedOrders = selectedOrders.filter(value => value !== 'selectAll');
    if (selectedOrders.length >= 2) {
      this.setState({ isSelectedMulti: true });
    } else {
      this.setState({ isSelectedMulti: false });
    }
    this.setState({ selectedOrders });
  }

  showAccountDetailView(selectedAccountID) {
    this.setState({ isAccountDetailViewOpen: true, selectedAccountID });
  }

  hideAccountDetailView() {
    this.setState({ isAccountDetailViewOpen: false, selectedAccountID: '' });
  }

  showProductDetailView(selectedProductID) {
    this.setState({ isProductDetailViewOpen: true, selectedProductID });
  }

  hideProductDetailView() {
    this.setState({ isProductDetailViewOpen: false, selectedProductID: '' });
  }

  showOrderDetailView(selectedOrderID) {
    this.setState({ isOrderDetailViewOpen: true, selectedOrderID });
  }

  hideOrderDetailView() {
    this.setState({ isOrderDetailViewOpen: false, selectedOrderID: '' });
  }

  updateOrderStatus(orderID, statusValue) {
    const order = this.state.ordersData.find(order => order._id === orderID);
    let data = order.data;
    data.status = statusValue;

    Meteor.call('orders.update', orderID, data, (err, res) => {
      if (err) {
        this.setState({ error: err.error });
      }
    });
  }

  showCompleteOrderModal(selectedOrders) {
    if (selectedOrders.length === 1) {
      this.setState({
        isCompleteOrderModalOpen: true,
        selectedOrders
      });
    }
  }

  hideCompleteOrderModal() {
    this.setState({ isCompleteOrderModalOpen: false, selectedOrders: [] });
  }

  showProductOrderModal(selectedOrderID) {
    this.setState({ isProductOrderModalOpen: true, selectedOrderID });
  }

  hideProductOrderModal() {
    this.setState({ isProductOrderModalOpen: false, selectedOrderID: '' });
  }

  showDeleteConfirmationModal(selectedOrders) {
    let confirmationDescription = [
      `
      작업지시 ${selectedOrders.length}건 취소하시겠습니까?
    `
    ];

    selectedOrders.map(orderID => {
      const order = OrdersData.findOne({ _id: orderID });
      const product = ProductsData.findOne({ _id: order.data.productID });
      const orderInfoText = `
        ${product.name} (${product.thick}x${product.length}x${product.width})
        = ${comma(order.data.orderQuantity)}매
      `;

      confirmationDescription.push(orderInfoText);
    });

    this.setState({
      isDeleteConfirmationModalOpen: true,
      selectedOrders,
      confirmationDescription
    });
  }

  hideDeleteConfirmationModal(answer) {
    this.setState({ isDeleteConfirmationModalOpen: false });

    if (answer) {
      this.state.selectedOrders.map(orderID => {
        Meteor.call('orders.remove', orderID);
      });
    }
  }

  // show order complete modal multi
  showCompleteMultiOrderModal() {
    this.setState({ isCompleteMultiOrderModalOpen: true });
  }

  hideCompleteMultiOrderModal() {
    this.setState({ isCompleteMultiOrderModalOpen: false });
  }

  getOrderList(queryObj) {
    return this.state.ordersData.map(order => {
      const product = this.state.productList.find(
        product => product._id === order.data.productID
      );
      const account = this.state.accountList.find(
        account => account._id === product.accountID
      );

      let matchQuery = false;

      const orderedAt = moment(order.data.orderedAt);
      const searchFrom = moment(queryObj.searchFrom);
      const searchTo = moment(queryObj.searchTo);

      if (
        searchFrom <= orderedAt &&
        orderedAt <= searchTo &&
        account.name.indexOf(queryObj.accountName) > -1 &&
        product.name.indexOf(queryObj.productName) > -1
      ) {
        if (!order.data.isCompleted) {
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
          <OrderListItem
            key={order._id}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            account={account}
            product={product}
            order={order}
            onCheckboxChange={this.onCheckboxChange}
            showAccountDetailView={this.showAccountDetailView}
            showProductDetailView={this.showProductDetailView}
            showOrderDetailView={this.showOrderDetailView}
            updateOrderStatus={this.updateOrderStatus}
            showCompleteOrderModal={this.showCompleteOrderModal}
            showProductOrderModal={this.showProductOrderModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        );
      }
    });
  }

  render() {
    return (
      <div className="list-container">
        {this.state.ordersCount &&
          (this.state.isAdmin || this.state.isManager) ? (
            <OrderListHeader
              onCheckboxChange={this.onCheckboxChange}
              isSelectedMulti={this.state.isSelectedMulti}
              selectedOrders={this.state.selectedOrders}
              showCompleteMultiOrderModal={this.showCompleteMultiOrderModal}
              showDeleteConfirmationModal={this.showDeleteConfirmationModal}
            />
          ) : (
            undefined
          )}

        <ul id="order-list">{this.getOrderList(this.state.queryObj)}</ul>

        {this.state.isAccountDetailViewOpen ? (
          <AccountDetailView
            isOpen={this.state.isAccountDetailViewOpen}
            accountID={this.state.selectedAccountID}
            onModalClose={this.hideAccountDetailView}
          />
        ) : (
          undefined
        )}

        {this.state.isProductDetailViewOpen ? (
          <ProductDetailView
            isOpen={this.state.isProductDetailViewOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.hideProductDetailView}
          />
        ) : (
          undefined
        )}

        {this.state.isOrderDetailViewOpen ? (
          <OrderDetailView
            isOpen={this.state.isOrderDetailViewOpen}
            orderID={this.state.selectedOrderID}
            onModalClose={this.hideOrderDetailView}
          />
        ) : (
          undefined
        )}

        {this.state.isCompleteOrderModalOpen ? (
          <CompleteOrderModal
            isOpen={this.state.isCompleteOrderModalOpen}
            orderID={this.state.selectedOrders[0]}
            onModalClose={this.hideCompleteOrderModal}
          />
        ) : (
          undefined
        )}

        {this.state.isProductOrderModalOpen ? (
          <ProductOrderModal
            isOpen={this.state.isProductOrderModalOpen}
            orderID={this.state.selectedOrderID}
            onModalClose={this.hideProductOrderModal}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        ) : (
          undefined
        )}

        {this.state.isDeleteConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="작업지시 취소"
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        ) : (
          undefined
        )}

        {this.state.isCompleteMultiOrderModalOpen ? (
          <CompleteMultiOrderModal
            isOpen={this.state.isCompleteMultiOrderModalOpen}
            selectedOrders={this.state.selectedOrders}
            onModalClose={this.hideCompleteMultiOrderModal}
          />
        ) : (
          undefined
        )}
      </div>
    );
  }
}
