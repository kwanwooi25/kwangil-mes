import React from 'react';

import Checkbox from '../../custom/Checkbox';

export default class ProductListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  plate
  product
  onCheckboxChange
  =========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager
    };

    // this.onAccountNameClick = this.onAccountNameClick.bind(this);
    // this.onProductNameClick = this.onProductNameClick.bind(this);
    // this.onProductOrderClick = this.onProductOrderClick.bind(this);
    // this.onEditClick = this.onEditClick.bind(this);
    // this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      isAdmin: props.isAdmin,
      isManager: props.isManager
    });
  }

  // onAccountNameClick(e) {
  //   selectedAccountID = e.target.name;
  //   this.props.showAccountDetailView(selectedAccountID);
  // }
  //
  // onProductNameClick(e) {
  //   const selectedProductID = e.target.parentNode.parentNode.parentNode.id;
  //   this.props.showProductDetailView(selectedProductID);
  // }
  //
  // onProductOrderClick(e) {
  //   const selectedProductID = this.getProductID(e.target);
  //   this.props.showProductOrderModal(selectedProductID);
  // }
  //
  // onEditClick(e) {
  //   const selectedProductID = this.getProductID(e.target);
  //   this.props.showProductModal(selectedProductID);
  // }
  //
  // onDeleteClick(e) {
  //   const selectedProductID = this.getProductID(e.target);
  //   this.props.showDeleteConfirmationModal([selectedProductID]);
  // }
  //
  // getProductID(target) {
  //   if (target.tagName === 'SPAN') {
  //     return target.parentNode.parentNode.parentNode.id;
  //   } else if (target.tagName === 'BUTTON') {
  //     return target.parentNode.parentNode.id;
  //   }
  // }

  render() {
    const plate = this.props.plate;
    console.log(plate);

    return (
      <li className="plate" key={plate._id} id={plate._id}>
        <div className="plate-checkbox-container">
          <Checkbox
            name={plate._id}
            onInputChange={this.props.onCheckboxChange}
          />
        </div>
        <div className="plate-container">
          <div className="plate-name-container">
            <a className="plate-plateName">
              {plate.name}
            </a>
          </div>
          <div className="plate-size-container">
            <a className="plate-plateSize">
              {plate.round} x {plate.length}
            </a>
          </div>
        </div>

        {this.state.isAdmin || this.state.isManager ? (
          <div className="plate-buttons-container">
            <button
              className="button button-with-icon-span plate-button"
              // onClick={this.onViewProductsClick}
            >
              <i className="fa fa-industry fa-lg" />
              <span>사용품목</span>
            </button>
            <button
              className="button button-with-icon-span plate-button"
              // onClick={this.onEditClick}
            >
              <i className="fa fa-edit fa-lg" />
              <span>수정</span>
            </button>
            <button
              className="button button-with-icon-span plate-button"
              // onClick={this.onDeleteClick}
            >
              <i className="fa fa-trash fa-lg" />
              <span>삭제</span>
            </button>
          </div>
        ) : (
          undefined
        )}
      </li>
    );
  }
}
