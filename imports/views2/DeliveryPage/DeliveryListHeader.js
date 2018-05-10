import React from 'react';

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

    this.onDeleteMultiClick = this.onDeleteMultiClick.bind(this);
    this.onCompleteDeliveryClick = this.onCompleteDeliveryClick.bind(this);
  }

  onCompleteDeliveryClick() {
    this.props.showConfirmationModal(this.props.selectedOrders, 'complete');
  }

  onDeleteMultiClick() {
    this.props.showConfirmationModal(this.props.selectedOrders, 'cancel');
  }

  render() {
    return (
      <div className="list-header">
        <Checkbox
          name="selectAll"
          label="전체선택"
          onInputChange={this.props.onCheckboxChange}
        />
        <div className="list-header-buttons-container">
          <button
            className="button button-with-icon-span list-header-button"
            onClick={this.onCompleteDeliveryClick}
            disabled={!this.props.isSelectedMulti}
          >
            <i className="fa fa-check fa-lg" />
            <span>완료</span>
          </button>
          <button
            className="button button-with-icon-span list-header-button"
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
