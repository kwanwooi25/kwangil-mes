import React from 'react';

import OrderDetailView from '../OrdersPage/OrderDetailView';

export default class OrderName extends React.Component {
  /*=========================================================================
  >> props <<
  className
  orderID
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isDetailViewOpen: false,
      orderID: props.orderID
    };

    this.onClick = this.onClick.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
  }

  onClick(e) {
    this.setState({ isDetailViewOpen: true });
  }

  onModalClose() {
    this.setState({ isDetailViewOpen: false });
  }

  render() {
    return (
      <div className={this.props.className + '-container'}>
        <a
          className={this.props.className}
          onClick={this.onClick}
        >
          {this.props.orderID}
        </a>

        {this.state.isDetailViewOpen ? (
          <OrderDetailView
            isOpen={this.state.isDetailViewOpen}
            orderID={this.state.orderID}
            onModalClose={this.onModalClose}
          />
        ) : (
          undefined
        )}
      </div>
    )
  }
}
