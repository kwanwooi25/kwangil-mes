import React from 'react';

import { printOrders } from '../../api/printOrders';

import Checkbox from "../../custom/Checkbox";

export default class DeliveryListHeader extends React.Component {
  /*=========================================================================
  >> props <<
  onCheckboxChange
  isSelectedMulti
  selectedOrders
  showDeliveryOrderModal
  showConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onDeliveryOrderClick = this.onDeliveryOrderClick.bind(this);
    this.onCompleteDeliveryClick = this.onCompleteDeliveryClick.bind(this);
  }

  onDeliveryOrderClick() {
    this.props.showDeliveryOrderModal(this.props.selectedOrders);
  }

  onCompleteDeliveryClick() {
    this.props.showConfirmationModal(this.props.selectedOrders);
  }

  render() {
    return (
      <div className="order-list-header">
        <Checkbox
          name="selectAll"
          label="전체선택"
          onInputChange={this.props.onCheckboxChange}
        />
        <div className="order-buttons-container">
          <button
            className="button button-with-icon-span delivery-list-item__button"
            onClick={this.onDeliveryOrderClick}
            disabled={!this.props.isSelectedMulti}
          >
            <i className="fa fa-truck fa-lg" />
            <span>출고등록</span>
          </button>
          <button
            className="button button-with-icon-span delivery-list-item__button"
            onClick={this.onCompleteDeliveryClick}
            disabled={!this.props.isSelectedMulti}
          >
            <i className="fa fa-check fa-lg" />
            <span>완료</span>
          </button>
        </div>
      </div>
    )
  }
}
