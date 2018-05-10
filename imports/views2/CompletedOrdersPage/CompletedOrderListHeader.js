import React from 'react';

import Checkbox from "../../custom/Checkbox";

export default class CompletedOrderListHeader extends React.Component {
  /*=========================================================================
  >> props <<
  onCheckboxChange
  isSelectedMulti
  selectedCompletedOrders
  showDeliveryOrderModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onDeliveryOrderClick = this.onDeliveryOrderClick.bind(this);
  }

  onDeliveryOrderClick() {
    this.props.showDeliveryOrderModal(this.props.selectedCompletedOrders);
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
            onClick={this.onDeliveryOrderClick}
            disabled={!this.props.isSelectedMulti}
          >
            <i className="fa fa-truck fa-lg" />
            <span>출고등록</span>
          </button>
        </div>
      </div>
    )
  }
}
