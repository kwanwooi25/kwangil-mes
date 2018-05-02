import React from 'react';
import moment from 'moment';

import { comma } from '../../api/comma';

import Spinner from '../../custom/Spinner';
import DeliveryListHeader from './DeliveryListHeader';
import DeliveryListItem from './DeliveryListItem';
import ConfirmationModal from '../components/ConfirmationModal';

export default class DeliveryList extends React.Component {
  /*=========================================================================
  >> props <<
  deliveryDate
  isAdmin
  isManager
  accountsData
  productsData
  ordersData
  deliveryData
  isDataReady
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      deliveryDate: props.deliveryDate,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData,
      productsData: props.productsData,
      ordersData: props.ordersData,
      deliveryData: props.deliveryData,
      isDataReady: props.isDataReady,
      isConfirmationModalOpen: false,
      selectedOrders: [],
      confirmationTitle: '',
      confirmationDescription: [],
      confirmFor: '',
      isSelectedMulti: false
    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.showConfirmationModal = this.showConfirmationModal.bind(this);
    this.hideConfirmationModal = this.hideConfirmationModal.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      deliveryDate: props.deliveryDate,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData,
      productsData: props.productsData,
      ordersData: props.ordersData,
      deliveryData: props.deliveryData,
      isDataReady: props.isDataReady
    });
  }

  onCheckboxChange(e) {
    let selectedOrders = this.state.selectedOrders;
    if (e.target.name === 'selectAll') {
      selectedOrders = [];
      const checkboxes = document.querySelectorAll(
        '#delivery-list input[type="checkbox"]:not(:disabled)'
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

  showConfirmationModal(selectedOrders, confirmFor) {
    let confirmationTitle = '';
    let confirmationDescription = [];

    if (confirmFor === 'complete') {
      confirmationTitle = '납품 완료';
      confirmationDescription = [
        `${selectedOrders.length}건 납품완료하시겠습니까?`
      ];
    } else if (confirmFor === 'cancel') {
      confirmationTitle = '출고지시 취소';
      confirmationDescription = [
        `${selectedOrders.length}건 출고 취소하시겠습니까?`
      ];
    }

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
      confirmationDescription,
      confirmFor
    });
  }

  hideConfirmationModal(answer) {
    this.setState({ isConfirmationModalOpen: false });

    if (answer) {
      this.state.selectedOrders.map(orderID => {
        const order = this.state.ordersData.find(
          order => order._id === orderID
        );

        if (this.state.confirmFor === 'complete') {
          order.data.isDelivered = true;
          Meteor.call('orders.update', order._id, order.data, (err, res) => {});
        } else if (this.state.confirmFor === 'cancel') {
          let removeFromDeliveryID = '';
          let orderIDToRemove = '';
          this.state.deliveryData.map(delivery => {
            let checkOrderID = delivery.orderList
              .map(order => order.orderID)
              .indexOf(order._id);
            if (checkOrderID > -1) {
              orderIDToRemove = checkOrderID;
              removeFromDeliveryID = delivery._id;
            }
          });
          let delivery = this.state.deliveryData.find(
            delivery => delivery._id === removeFromDeliveryID
          );

          delivery.orderList.splice(orderIDToRemove, 1);
          order.data.deliveredAt = '';

          Meteor.call('orders.update', order._id, order.data, (err, res) => {});
          Meteor.call(
            'delivery.update',
            delivery._id,
            delivery.orderList,
            (err, res) => {}
          );
        }
      });

      // reset checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }

      // reset selectedOrders array
      this.setState({ selectedOrders: [], isSelectedMulti: false });
    }
  }

  getDeliveryList(deliveryDate) {
    const delivery = this.props.deliveryData.find(
      delivery => delivery._id === deliveryDate
    );
    let ordersToDeliver = [];

    if (delivery) {
      delivery.orderList.map(({ orderID, deliverBy }) => {
        let order = this.props.ordersData.find(order => order._id === orderID);
        order.deliverBy = deliverBy;
        ordersToDeliver.push(order);
      });

      return ordersToDeliver
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
          let account;
          if (product) {
            account = this.state.accountsData.find(
              account => account._id === product.accountID
            );
          }

          if (account && product) {
            return (
              <DeliveryListItem
                key={order._id}
                isAdmin={this.state.isAdmin}
                isManager={this.state.isManager}
                account={account}
                product={product}
                order={order}
                onCheckboxChange={this.onCheckboxChange}
                showConfirmationModal={this.showConfirmationModal}
              />
            );
          }
        });
    }
  }

  render() {
    return (
      <div className="list-container">
        {(this.state.isAdmin || this.state.isManager) && (
          <DeliveryListHeader
            onCheckboxChange={this.onCheckboxChange}
            isSelectedMulti={this.state.isSelectedMulti}
            selectedOrders={this.state.selectedOrders}
            showConfirmationModal={this.showConfirmationModal}
          />
        )}

        <ul id="delivery-list" className="list">
          {this.state.isDataReady ? (
            this.getDeliveryList(this.state.deliveryDate)
          ) : (
            <Spinner />
          )}
        </ul>

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
