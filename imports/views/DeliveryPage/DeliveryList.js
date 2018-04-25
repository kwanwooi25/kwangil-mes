import React from 'react';
import moment from 'moment';

import { comma } from '../../api/comma';

import DeliveryListHeader from './DeliveryListHeader';
import DeliveryListItem from './DeliveryListItem';
import AccountDetailView from '../AccountsPage/AccountDetailView';
import ProductDetailView from '../ProductsPage/ProductDetailView';
import OrderDetailView from '../OrdersPage/OrderDetailView';
import DeliveryOrderModal from './DeliveryOrderModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class DeliveryList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter list
  isAdmin
  isManager
  accountsData
  productsData
  ordersData
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      query: props.query,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData,
      productsData: props.productsData,
      ordersData: props.ordersData,
      ordersCount: props.ordersData.length,
      isAccountDetailViewOpen: false,
      isProductDetailViewOpen: false,
      isOrderDetailViewOpen: false,
      isDeliveryOrderModalOpen: false,
      isMultiDeliveryOrderModalOpen: false,
      isConfirmationModalOpen: false,
      selectedAccountID: '',
      selectedProductID: '',
      selectedOrderID: '',
      selectedOrders: [],
      confirmationTitle: '',
      confirmationDescription: [],
      isSelectedMulti: false
    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.showAccountDetailView = this.showAccountDetailView.bind(this);
    this.hideAccountDetailView = this.hideAccountDetailView.bind(this);
    this.showProductDetailView = this.showProductDetailView.bind(this);
    this.hideProductDetailView = this.hideProductDetailView.bind(this);
    this.showOrderDetailView = this.showOrderDetailView.bind(this);
    this.hideOrderDetailView = this.hideOrderDetailView.bind(this);
    this.showDeliveryOrderModal = this.showDeliveryOrderModal.bind(this);
    this.hideDeliveryOrderModal = this.hideDeliveryOrderModal.bind(this);
    this.showConfirmationModal = this.showConfirmationModal.bind(this);
    this.hideConfirmationModal = this.hideConfirmationModal.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      query: props.query,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData,
      productsData: props.productsData,
      ordersData: props.ordersData,
      ordersCount: props.ordersData.length
    });
  }

  onCheckboxChange(e) {
    let selectedOrders = this.state.selectedOrders;
    if (e.target.name === 'selectAll') {
      selectedOrders = [];
      const checkboxes = document.querySelectorAll(
        '#delivery-list input[type="checkbox"]'
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

  showDeliveryOrderModal(selectedOrders) {
    this.setState({ isDeliveryOrderModalOpen: true, selectedOrders });
  }

  hideDeliveryOrderModal() {
    this.setState({
      isDeliveryOrderModalOpen: false,
      selectedOrders: [],
      isSelectedMulti: false
    });
  }

  showConfirmationModal(selectedOrders) {
    let confirmationTitle = '납품 완료';
    let confirmationDescription = [
      `${selectedOrders.length}건 납품완료하시겠습니까?`
    ];

    selectedOrders.map(orderID => {
      const order = this.state.ordersData.find(order => order._id === orderID);
      const product = this.state.productsData.find(
        product => product._id === order.data.productID
      );
      const deliveryInfoText = `${product.name} (${product.thick}x${
        product.length
      }x${product.width}) = ${comma(order.data.completedQuantity)}매`;

      confirmationDescription.push(deliveryInfoText);
    });

    this.setState({
      isConfirmationModalOpen: true,
      selectedOrders,
      confirmationTitle,
      confirmationDescription
    });
  }

  hideConfirmationModal(answer) {
    if (answer) {
      this.state.selectedOrders.map(orderID => {
        const order = this.state.ordersData.find(
          order => order._id === orderID
        );
        order.data.isDelivered = true;
        order.data.deliveredAt = moment().format('YYYY-MM-DD');

        Meteor.call('orders.update', order._id, order.data, (err, res) => {});
      });
    }

    this.setState({
      isConfirmationModalOpen: false,
      selectedOrders: [],
      isSelectedMulti: false
    });
  }

  getDeliveryList(query) {
    return this.state.ordersData
      .sort((a, b) => {
        const a_deliverBefore = a.data.deliverBefore;
        const b_deliverBefore = b.data.deliverBefore;
        if (a_deliverBefore > b_deliverBefore) return 1;
        if (a_deliverBefore < b_deliverBefore) return -1;
        return 0;
      })
      .map(order => {
        const product = this.state.productsData.find(
          product => product._id === order.data.productID
        );
        const account = this.state.accountsData.find(
          account => account._id === product.accountID
        );

        let matchQuery = false;

        if (
          (account.name.indexOf(query) > -1 ||
            product.name.indexOf(query) > -1) &&
          order.data.isCompleted &&
          !order.data.isDelivered
        ) {
          matchQuery = true;
        }

        // only show product that has matching query text
        if (matchQuery) {
          return (
            <DeliveryListItem
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
              showDeliveryOrderModal={this.showDeliveryOrderModal}
              showConfirmationModal={this.showConfirmationModal}
            />
          );
        }
      });
  }

  render() {
    return (
      <div className="list-container">
        {this.state.ordersCount > 0 &&
          (this.state.isAdmin || this.state.isManager) ? (
            <DeliveryListHeader
              onCheckboxChange={this.onCheckboxChange}
              isSelectedMulti={this.state.isSelectedMulti}
              selectedOrders={this.state.selectedOrders}
              showDeliveryOrderModal={this.showDeliveryOrderModal}
              showConfirmationModal={this.showConfirmationModal}
            />
          ) : (
            undefined
          )}

        <ul id="delivery-list" className="list">
          {this.getDeliveryList(this.state.query)}
        </ul>

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

        {this.state.isDeliveryOrderModalOpen ? (
          <DeliveryOrderModal
            isOpen={this.state.isDeliveryOrderModalOpen}
            selectedOrders={this.state.selectedOrders}
            onModalClose={this.hideDeliveryOrderModal}
          />
        ) : (
          undefined
        )}

        {this.state.isConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title={this.state.confirmationTitle}
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideConfirmationModal}
          />
        ) : (
          undefined
        )}
      </div>
    );
  }
}
