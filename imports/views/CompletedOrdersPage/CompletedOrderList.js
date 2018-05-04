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
  isAdmin
  isManager
  accountsData
  productsData
  filteredOrdersData
  isDataReady
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isDeliveryOrderModalOpen: false,
      selectedOrders: [],
      confirmationTitle: '',
      confirmationDescription: [],
      isSelectedMulti: false
    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.showDeliveryOrderModal = this.showDeliveryOrderModal.bind(this);
    this.hideDeliveryOrderModal = this.hideDeliveryOrderModal.bind(this);
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

  hideDeliveryOrderModal(answer) {
    this.setState({ isDeliveryOrderModalOpen: false });

    if (answer) {
      // reset checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }

      // reset selectedOrders array
      this.setState({ selectedOrders: [], isSelectedMulti: false });
    }
  }

  getCompletedOrderList() {
    return this.props.filteredOrdersData
      .sort((a, b) => {
        const a_deliverBefore = a.data.deliverBefore;
        const b_deliverBefore = b.data.deliverBefore;
        if (a_deliverBefore > b_deliverBefore) return 1;
        if (a_deliverBefore < b_deliverBefore) return -1;
        return 0;
      })
      .map(order => {
        const product = this.props.productsData.find(
          product => product._id === order.data.productID
        );
        const account = this.props.accountsData.find(
          account => account._id === product.accountID
        );

        return (
          <CompletedOrderListItem
            key={order._id}
            isAdmin={this.props.isAdmin}
            isManager={this.props.isManager}
            account={account}
            product={product}
            order={order}
            onCheckboxChange={this.onCheckboxChange}
            showDeliveryOrderModal={this.showDeliveryOrderModal}
          />
        );
      });
  }

  render() {
    return (
      <div className="list-container">
        {(this.props.isAdmin || this.props.isManager) && (
          <CompletedOrderListHeader
            onCheckboxChange={this.onCheckboxChange}
            isSelectedMulti={this.state.isSelectedMulti}
            selectedOrders={this.state.selectedOrders}
            showDeliveryOrderModal={this.showDeliveryOrderModal}
          />
        )}

        <ul id="completed-order-list" className="list">
          {this.props.isDataReady ? (
            this.getCompletedOrderList()
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
      </div>
    );
  }
}
