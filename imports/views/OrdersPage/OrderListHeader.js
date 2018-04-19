import React from 'react';

import { printOrders } from '../../api/printOrders';

import Checkbox from "../../custom/Checkbox";

export default class OrderListHeader extends React.Component {
  /*=========================================================================
  >> props <<
  onCheckboxChange
  isSelectedMulti
  selectedOrders

  ** TODO showAccountDetailView
  showProductDetailView
  updateOrderStatus
  showCompleteOrderModal
  showProductOrderModal
  showDeleteConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onPrintOrderMultiClick = this.onPrintOrderMultiClick.bind(this);
  }

  onPrintOrderMultiClick() {
    printOrders(this.props.selectedOrders);
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
            onClick={this.onPrintOrderMultiClick}
            disabled={!this.props.isSelectedMulti}
          >
            <i className="fa fa-print fa-lg" />
            <span>출력</span>
          </button>
          <button
            className="button button-with-icon-span order-button"
            onClick={this.onCompleteOrderMultiClick}
            disabled={!this.props.isSelectedMulti}
          >
            <i className="fa fa-check fa-lg" />
            <span>완료</span>
          </button>
          <button
            className="button button-with-icon-span order-button"
            onClick={this.onDeleteMultiClick}
            disabled={!this.props.isSelectedMulti}
          >
            <i className="fa fa-trash fa-lg" />
            <span>삭제</span>
          </button>
        </div>
      </div>
    )
  }
}
