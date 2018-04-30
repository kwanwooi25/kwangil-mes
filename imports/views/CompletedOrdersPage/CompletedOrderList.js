import React from 'react';
import moment from 'moment';

import { comma } from '../../api/comma';

import Spinner from '../../custom/Spinner';
import CompletedOrderListHeader from './CompletedOrderListHeader';
import CompletedOrderListItem from './CompletedOrderListItem';
import DeliveryOrderModal from './DeliveryOrderModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class CompletedOrderList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter list
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
      query: props.query,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData,
      productsData: props.productsData,
      ordersData: props.ordersData,
      isDataReady: props.isDataReady,
      isDeliveryOrderModalOpen: false,
      isConfirmationModalOpen: false,
      selectedOrders: [],
      confirmationTitle: '',
      confirmationDescription: [],
      isSelectedMulti: false
    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
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
      isDataReady: props.isDataReady
    });
  }

  onCheckboxChange(e) {
    let selectedOrders = this.state.selectedOrders;
    if (e.target.name === 'selectAll') {
      selectedOrders = [];
      const checkboxes = document.querySelectorAll(
        '#completed-order-list input[type="checkbox"]:not(:disabled)'
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

  getCompletedOrderList(query) {
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
            <CompletedOrderListItem
              key={order._id}
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              account={account}
              product={product}
              order={order}
              onCheckboxChange={this.onCheckboxChange}
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
        {(this.state.isAdmin || this.state.isManager) && (
          <CompletedOrderListHeader
            onCheckboxChange={this.onCheckboxChange}
            isSelectedMulti={this.state.isSelectedMulti}
            selectedOrders={this.state.selectedOrders}
            showDeliveryOrderModal={this.showDeliveryOrderModal}
            showConfirmationModal={this.showConfirmationModal}
          />
        )}

        <ul id="completed-order-list" className="list">
          {this.state.isDataReady ? (
            this.getCompletedOrderList(this.state.query)
          ) : (
            <Spinner />
          )}
        </ul>

        {this.state.isDeliveryOrderModalOpen && (
          <DeliveryOrderModal
            isOpen={this.state.isDeliveryOrderModalOpen}
            selectedOrders={this.state.selectedOrders}
            onModalClose={this.hideDeliveryOrderModal}
          />
        )}

        {this.state.isConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title={this.state.confirmationTitle}
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideConfirmationModal}
          />
        )}
      </div>
    );
  }
}
