import React from 'react';
import moment from 'moment';

import { comma } from '../../api/comma';

import Spinner from '../../custom/Spinner';
import OrderListHeader from './OrderListHeader';
import OrderListItem from './OrderListItem';
import NoResult from '../components/NoResult';
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
  filteredOrdersData
  isDataReady
  queryObj
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      queryObj: props.queryObj,
      filteredOrdersData: props.filteredOrdersData,
      isCompleteOrderModalOpen: false,
      isProductOrderModalOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedOrderID: '',
      selectedOrders: Session.get('selectedOrders') || [],
      confirmationDescription: []
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

  componentWillReceiveProps(props) {
    this.setState({
      filteredOrdersData: props.filteredOrdersData,
      queryObj: props.queryObj
    });
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

    this.setState({ selectedOrders }, () => {
      Session.set('selectedOrders', selectedOrders);
    });
  }

  updateOrderStatus(orderID, statusValue) {
    const order = this.state.filteredOrdersData.find(order => order._id === orderID);
    let data = order;
    data.status = statusValue;

    Meteor.call('orders.update', orderID, data, (err, res) => {
      if (err) {
        this.setState({ error: err.error });
      }
    });
  }

  showCompleteOrderModal(selectedOrders) {
    this.setState({ isCompleteOrderModalOpen: true, selectedOrders }, () => {
      Session.set('selectedOrders', selectedOrders);
    });
  }

  hideCompleteOrderModal(answer) {
    this.setState({ isCompleteOrderModalOpen: false });

    if (answer) {
      // reset selectAll checkbox
      document.querySelector('input[name="selectAll"]').checked = false;

      // reset selectedOrders array
      this.setState({ selectedOrders: [] }, () => {
        Session.set('selectedOrders', []);
      });
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
      const order = this.state.filteredOrdersData.find(
        order => order._id === orderID
      );
      const product = this.props.productsData.find(
        product => product._id === order.productID
      );
      const orderInfoText = `${product.name} (${product.thick}x${
        product.length
      }x${product.width}) = ${comma(order.orderQuantity)}매`;

      confirmationDescription.push(orderInfoText);
    });

    this.setState(
      {
        isDeleteConfirmationModalOpen: true,
        selectedOrders,
        confirmationDescription
      },
      () => {
        Session.set('selectedOrders', selectedOrders);
      }
    );
  }

  hideDeleteConfirmationModal(answer) {
    this.setState({ isDeleteConfirmationModalOpen: false });

    if (answer) {
      this.state.selectedOrders.map(orderID => {
        const order = this.state.filteredOrdersData.find(
          order => order._id === orderID
        );
        let product = this.props.productsData.find(
          product => product._id === order.productID
        );
        let historyArrayModified = [];
        product.history.map(({ _id, orderQuantity }) => {
          if ( _id !== order.orderedAt) {
            historyArrayModified.push({ _id, orderQuantity });
          }
        })
        product.history = historyArrayModified;

        Meteor.call('orders.remove', orderID, (err, res) => {
          if (!err) {
            Meteor.call('products.update', product._id, product);
          }
        });
      });

      // reset selectAll checkbox
      document.querySelector('input[name="selectAll"]').checked = false;

      // reset selectedOrders array
      this.setState({ selectedOrders: [] }, () => {
        Session.set('selectedOrders', []);
      });
    }
  }

  getOrderList() {
    if (this.state.filteredOrdersData.length > 0) {
      return this.state.filteredOrdersData.map(order => {
        const product = this.props.productsData.find(
          product => product._id === order.productID
        );
        const account = this.props.accountsData.find(
          account => account._id === product.accountID
        );
        const selectedOrders = this.state.selectedOrders;
        let isSelected = false;
        if (selectedOrders) {
          selectedOrders.map(orderID => {
            if (order._id === orderID) {
              isSelected = true;
            }
          });
        }

        return (
          <OrderListItem
            key={order._id}
            isSelected={isSelected}
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
            queryObj={this.state.queryObj}
          />
        );
      });
    } else {
      return <NoResult />;
    }
  }

  render() {
    return (
      <div className="list-container">
        {(this.props.isAdmin || this.props.isManager) && (
          <OrderListHeader
            onCheckboxChange={this.onCheckboxChange}
            isSelectedMulti={this.state.selectedOrders.length >= 2}
            selectedOrders={this.state.selectedOrders}
            showCompleteOrderModal={this.showCompleteOrderModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        )}

        <ul id="order-list" className="list">
          {this.props.isDataReady ? this.getOrderList() : <Spinner />}
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
