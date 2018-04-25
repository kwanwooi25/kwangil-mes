import React from 'react';

import { printOrders } from '../../api/printOrders';

import Checkbox from "../../custom/Checkbox";

export default class DeliveryListHeader extends React.Component {
  /*=========================================================================
  >> props <<
  onCheckboxChange
  isSelectedMulti
  selectedOrders
  showCompleteConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    // this.onPrintMultiOrderClick = this.onPrintMultiOrderClick.bind(this);
    this.onCompleteMultiDeliveryClick = this.onCompleteMultiDeliveryClick.bind(this);
  }

  // onPrintMultiOrderClick() {
  //   printOrders(this.props.selectedOrders);
  // }

  onCompleteMultiDeliveryClick() {
    this.props.showCompleteConfirmationModal(this.props.selectedOrders);
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
            className="button button-with-icon-span order-button"
            // onClick={this.onPrintMultiOrderClick}
            disabled={!this.props.isSelected}
          >
            <i className="fa fa-print fa-lg" />
            <span>출력</span>
          </button>
          <button
            className="button button-with-icon-span order-button"
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
