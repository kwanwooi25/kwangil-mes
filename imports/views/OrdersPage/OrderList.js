import React from 'react';
import moment from 'moment';

import { comma } from '../../api/comma';

import Spinner from '../../custom/Spinner';
import OrderListHeader from './OrderListHeader';
import OrderListItem from './OrderListItem';
import ProductOrderModal from '../ProductsPage/ProductOrderModal';
import CompleteOrderModal from './CompleteOrderModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class OrderList extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  accountsData
  productsData
  ordersData
  isDataReady
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isCompleteOrderModalOpen: false,
      isProductOrderModalOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedOrderID: '',
      selectedOrders: [],
      confirmationDescription: [],
      isSelectedMulti: false
    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
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
  }

  onCheckboxChange(e) {
    let selectedOrders = this.state.selectedOrders;
    if (e.target.name === 'selectAll') {
      selectedOrders = [];
      const checkboxes = document.querySelectorAll(
        '#order-list input[type="checkbox"]:not(:disabled)'
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

  updateOrderStatus(orderID, statusValue) {
    const order = this.props.ordersData.find(order => order._id === orderID);
    let data = order.data;
    data.status = statusValue;

    Meteor.call('orders.update', orderID, data, (err, res) => {
      if (err) {
        this.setState({ error: err.error });
      }
    });
  }

  showCompleteOrderModal(selectedOrders) {
    this.setState({ isCompleteOrderModalOpen: true, selectedOrders });
  }

  hideCompleteOrderModal(answer) {
    this.setState({ isCompleteOrderModalOpen: false });

    if (answer) {
      // reset selectAll checkbox
      document.querySelector('input[name="selectAll"]').checked = false;

      // reset selectedOrders array
      this.setState({ selectedOrders: [], isSelectedMulti: false });
    }
  }

  showProductOrderModal(selectedOrderID) {
    this.setState({ isProductOrderModalOpen: true, selectedOrderID });
  }

  hideProductOrderModal() {
    this.setState({ isProductOrderModalOpen: false, selectedOrderID: '' });
  }

  showDeleteConfirmationModal(selectedOrders) {
    let confirmationDescription = [
      `작업지시 ${selectedOrders.length}건 취소하시겠습니까?`
    ];

    selectedOrders.map(orderID => {
      const order = this.props.ordersData.find(order => order._id === orderID);
      const product = this.props.productsData.find(
        product => product._id === order.data.productID
      );
      const orderInfoText = `${product.name} (${product.thick}x${
        product.length
      }x${product.width}) = ${comma(order.data.orderQuantity)}매`;

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

      // reset selectAll checkbox
      document.querySelector('input[name="selectAll"]').checked = false;

      // reset selectedOrders array
      this.setState({ selectedOrders: [], isSelectedMulti: false });
    }
  }

  getOrderList() {
    return this.props.ordersData.map(order => {
      const product = this.props.productsData.find(
        product => product._id === order.data.productID
      );
      const account = this.props.accountsData.find(
        account => account._id === product.accountID
      );
      return (
        <OrderListItem
          key={order._id}
          isAdmin={this.props.isAdmin}
          isManager={this.props.isManager}
          account={account}
          product={product}
          order={order}
          onCheckboxChange={this.onCheckboxChange}
          updateOrderStatus={this.updateOrderStatus}
          showCompleteOrderModal={this.showCompleteOrderModal}
          showProductOrderModal={this.showProductOrderModal}
          showDeleteConfirmationModal={this.showDeleteConfirmationModal}
        />
      );
    });
  }

  render() {
    return (
      <div className="list-container">
        {(this.props.isAdmin || this.props.isManager) && (
          <OrderListHeader
            onCheckboxChange={this.onCheckboxChange}
            isSelectedMulti={this.state.isSelectedMulti}
            selectedOrders={this.state.selectedOrders}
            showCompleteOrderModal={this.showCompleteOrderModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        )}

        <ul id="order-list" className="list">
          {this.props.isDataReady ? (
            this.getOrderList()
          ) : (
            <Spinner />
          )}
        </ul>

        {this.state.isCompleteOrderModalOpen && (
          <CompleteOrderModal
            isOpen={this.state.isCompleteOrderModalOpen}
            selectedOrders={this.state.selectedOrders}
            onModalClose={this.hideCompleteOrderModal}
          />
        )}

        {this.state.isProductOrderModalOpen && (
          <ProductOrderModal
            isOpen={this.state.isProductOrderModalOpen}
            orderID={this.state.selectedOrderID}
            onModalClose={this.hideProductOrderModal}
            isAdmin={this.props.isAdmin}
            isManager={this.props.isManager}
          />
        )}

        {this.state.isDeleteConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="작업지시 취소"
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        )}
      </div>
    );
  }
}
