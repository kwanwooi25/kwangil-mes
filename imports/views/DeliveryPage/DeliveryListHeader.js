import React from 'react';

import { printOrders } from '../../api/printOrders';

import Checkbox from "../../custom/Checkbox";

export default class DeliveryListHeader extends React.Component {
  /*=========================================================================
  >> props <<
  onCheckboxChange
  isSelectedMulti
  selectedOrders
  showConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onMultiDeliveryOrderClick = this.onMultiDeliveryOrderClick.bind(this);
    this.onCompleteMultiDeliveryClick = this.onCompleteMultiDeliveryClick.bind(this);
  }

  onMultiDeliveryOrderClick() {

  }

  onCompleteMultiDeliveryClick() {
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
            onClick={this.onMultiDeliveryOrderClick}
            disabled={!this.props.isSelected}
          >
            <i className="fa fa-truck fa-lg" />
            <span>출고등록</span>
          </button>
          <button
            className="button button-with-icon-span delivery-list-item__button"
            onClick={this.onCompleteMultiDeliveryClick}
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
