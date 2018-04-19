import React from 'react';

import { printOrders } from '../../api/printOrders';

import Checkbox from "../../custom/Checkbox";

export default class OrderListHeader extends React.Component {
  /*=========================================================================
  >> props <<
  onCheckboxChange
  isSelectedMulti
  selectedOrders
  showCompleteMultiOrderModal
  showDeleteConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onPrintMultiOrderClick = this.onPrintMultiOrderClick.bind(this);
    this.onCompleteMultiOrderClick = this.onCompleteMultiOrderClick.bind(this);
    this.onDeleteMultiClick = this.onDeleteMultiClick.bind(this);
  }

  onPrintMultiOrderClick() {
    printOrders(this.props.selectedOrders);
  }

  onCompleteMultiOrderClick() {
    this.props.showCompleteMultiOrderModal();
  }

  onDeleteMultiClick() {
    this.props.showDeleteConfirmationModal(this.props.selectedOrders);
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
            onClick={this.onPrintMultiOrderClick}
            disabled={!this.props.isSelectedMulti}
          >
            <i className="fa fa-print fa-lg" />
            <span>출력</span>
          </button>
          <button
            className="button button-with-icon-span order-button"
            onClick={this.onCompleteMultiOrderClick}
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
