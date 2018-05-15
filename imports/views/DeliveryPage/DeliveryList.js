import React from 'react';
import moment from 'moment';

import { comma } from '../../api/comma';

import Spinner from '../../custom/Spinner';
import DeliveryListHeader from './DeliveryListHeader';
import DeliveryListItem from './DeliveryListItem';
import NoResult from '../components/NoResult';
import ConfirmationModal from '../components/ConfirmationModal';

export default class DeliveryList extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  accountsData
  productsData
  ordersData
  deliveryData
  selectedDelivery
  isDataReady
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
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
      const order = this.props.ordersData.find(order => order._id === orderID);
      const product = this.props.productsData.find(
        product => product._id === order.productID
      );
      const deliveryInfoText = `${product.name} (${product.thick}x${
        product.length
      }x${product.width}) = ${comma(order.completedQuantity)}매`;

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
        const order = this.props.ordersData.find(
          order => order._id === orderID
        );

        if (this.state.confirmFor === 'complete') {
          order.isDelivered = true;
          Meteor.call('orders.update', order._id, order, (err, res) => {});
        } else if (this.state.confirmFor === 'cancel') {
          let removeFromDeliveryID = '';
          let orderIDToRemove = '';
          this.props.deliveryData.map(delivery => {
            let checkOrderID = delivery.orderList
              .map(order => order.orderID)
              .indexOf(order._id);
            if (checkOrderID > -1) {
              orderIDToRemove = checkOrderID;
              removeFromDeliveryID = delivery._id;
            }
          });
          let delivery = this.props.deliveryData.find(
            delivery => delivery._id === removeFromDeliveryID
          );

          delivery.orderList.splice(orderIDToRemove, 1);
          order.deliveredAt = '';

          Meteor.call('orders.update', order._id, order, (err, res) => {});
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

  getDeliveryList() {
    const delivery = this.props.selectedDelivery;
    if (delivery) {
      let ordersToDeliver = [];

      if (delivery.orderList.length !== 0) {
        delivery.orderList.map(({ orderID, deliverBy }) => {
          let order = this.props.ordersData.find(
            order => order._id === orderID
          );
          order.deliverBy = deliverBy;
          ordersToDeliver.push(order);
        });

        return ordersToDeliver
          .sort((a, b) => {
            if (a.deliverBefore > b.deliverBefore) return 1;
            if (a.deliverBefore < b.deliverBefore) return -1;
            return 0;
          })
          .map(order => {
            const product = this.props.productsData.find(
              product => product._id === order.productID
            );
            let account;
            if (product) {
              account = this.props.accountsData.find(
                account => account._id === product.accountID
              );
            }

            if (account && product) {
              return (
                <DeliveryListItem
                  key={order._id}
                  isAdmin={this.props.isAdmin}
                  isManager={this.props.isManager}
                  account={account}
                  product={product}
                  order={order}
                  onCheckboxChange={this.onCheckboxChange}
                  showConfirmationModal={this.showConfirmationModal}
                />
              );
            }
          });
      } else {
        return <NoResult />;
      }
    } else {
      return <NoResult />;
    }
  }

  render() {
    return (
      <div className="list-container">
        {(this.props.isAdmin || this.props.isManager) && (
          <DeliveryListHeader
            onCheckboxChange={this.onCheckboxChange}
            isSelectedMulti={this.state.isSelectedMulti}
            selectedOrders={this.state.selectedOrders}
            showConfirmationModal={this.showConfirmationModal}
          />
        )}

        <ul id="delivery-list" className="list">
          {this.props.isDataReady ? this.getDeliveryList() : <Spinner />}
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
