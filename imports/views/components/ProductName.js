import React from 'react';

import ProductDetailView from '../ProductsPage/ProductDetailView';

export default class ProductName extends React.Component {
  /*=========================================================================
  >> props <<
  className
  productID
  productName
  query
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
    const query = this.props.query;
    let productName = this.props.productName;

    if (query && productName.toLowerCase().indexOf(query) > -1) {
      const index = productName.toLowerCase().indexOf(query);
      const matchingText = productName.substring(index, index + query.length);
      productName = productName.replace(
        matchingText,
        `<span class="highlight">${matchingText}</span>`
      );
    }

    return (
      <div className={this.props.className + '-container'}>
        <a
          className={'link ' + this.props.className}
          onClick={this.onClick}
          dangerouslySetInnerHTML={{ __html: productName }}
        >
        </a>

        {this.state.isDetailViewOpen && (
          <ProductDetailView
            isOpen={this.state.isDetailViewOpen}
            productID={this.state.productID}
            onModalClose={this.onModalClose}
          />
        )}
      </div>
    )
  }
}
