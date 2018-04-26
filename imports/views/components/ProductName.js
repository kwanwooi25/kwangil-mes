import React from 'react';

import ProductDetailView from '../ProductsPage/ProductDetailView';

export default class ProductName extends React.Component {
  /*=========================================================================
  >> props <<
  className
  productID
  productName
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isDetailViewOpen: false,
      productID: props.productID
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
          {this.props.productName}
        </a>

        {this.state.isDetailViewOpen ? (
          <ProductDetailView
            isOpen={this.state.isDetailViewOpen}
            productID={this.state.productID}
            onModalClose={this.onModalClose}
          />
        ) : (
          undefined
        )}
      </div>
    )
  }
}
