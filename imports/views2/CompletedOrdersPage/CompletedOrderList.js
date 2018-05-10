import React from 'react';
import moment from 'moment';

import { comma } from '../../api/comma';

import Spinner from '../../custom/Spinner';
import CompletedOrderListHeader from './CompletedOrderListHeader';
import CompletedOrderListItem from './CompletedOrderListItem';
import NoResult from '../components/NoResult';
import DeliveryOrderModal from './DeliveryOrderModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class CompletedOrderList extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  accountsData
  productsData
  ordersData
  filteredOrdersData
  isDataReady
  query
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      query: props.query,
      filteredOrdersData: props.filteredOrdersData,
      isDeliveryOrderModalOpen: false,
      selectedCompletedOrders: Session.get('selectedCompletedOrders') || [],
      confirmationTitle: '',
      confirmationDescription: []
    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.showDeliveryOrderModal = this.showDeliveryOrderModal.bind(this);
    this.hideDeliveryOrderModal = this.hideDeliveryOrderModal.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      query: props.query,
      filteredOrdersData: props.filteredOrdersData
    });
  }

  onCheckboxChange(e) {
    let selectedCompletedOrders = this.state.selectedCompletedOrders;
    if (e.target.name === 'selectAll') {
      selectedCompletedOrders = [];
      const checkboxes = document.querySelectorAll(
        '#completed-order-list input[type="checkbox"]:not(:disabled)'
      );

      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = e.target.checked;
        if (e.target.checked) {
          selectedCompletedOrders.push(checkboxes[i].name);
        }
      }
    } else {
      selectedCompletedOrders = selectedCompletedOrders.filter(
        value => value !== e.target.name
      );
      if (e.target.checked) {
        selectedCompletedOrders.push(e.target.name);
      }
    }
    selectedCompletedOrders = selectedCompletedOrders.filter(
      value => value !== 'selectAll'
    );

    this.setState({ selectedCompletedOrders }, () => {
      Session.set('selectedCompletedOrders', selectedCompletedOrders);
    });
  }

  showDeliveryOrderModal(selectedCompletedOrders) {
    this.setState({ isDeliveryOrderModalOpen: true, selectedCompletedOrders });
  }

  hideDeliveryOrderModal(answer) {
    this.setState({ isDeliveryOrderModalOpen: false });

    if (answer) {
      // reset checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }

      // reset selectedCompletedOrders array
      this.setState({ selectedCompletedOrders: [] }, () => {
        Session.set('selectedCompletedOrders', []);
      });
    }
  }

  getCompletedOrderList() {
    if (this.state.filteredOrdersData.length > 0) {
      return this.state.filteredOrdersData
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
          const selectedCompletedOrders = this.state.selectedCompletedOrders;
          let isSelected = false;
          if (selectedCompletedOrders) {
            selectedCompletedOrders.map(orderID => {
              if (order._id === orderID) {
                isSelected = true;
              }
            });
          }

          return (
            <CompletedOrderListItem
              key={order._id}
              isSelected={isSelected}
              isAdmin={this.props.isAdmin}
              isManager={this.props.isManager}
              account={account}
              product={product}
              order={order}
              onCheckboxChange={this.onCheckboxChange}
              showDeliveryOrderModal={this.showDeliveryOrderModal}
              query={this.state.query}
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
          <CompletedOrderListHeader
            onCheckboxChange={this.onCheckboxChange}
            isSelectedMulti={this.state.selectedCompletedOrders.length >= 2}
            selectedCompletedOrders={this.state.selectedCompletedOrders}
            showDeliveryOrderModal={this.showDeliveryOrderModal}
          />
        )}

        <ul id="completed-order-list" className="list">
          {this.props.isDataReady ? this.getCompletedOrderList() : <Spinner />}
        </ul>

        {this.state.isDeliveryOrderModalOpen && (
          <DeliveryOrderModal
            isOpen={this.state.isDeliveryOrderModalOpen}
            selectedCompletedOrders={this.state.selectedCompletedOrders}
            onModalClose={this.hideDeliveryOrderModal}
          />
        )}
      </div>
    );
  }
}
