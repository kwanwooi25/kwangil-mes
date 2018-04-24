import React from 'react';

import Checkbox from '../../custom/Checkbox';

export default class PlateListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  plate
  productsData
  onCheckboxChange
  showPlateDetailView
  showProductDetailView
  showPlateModal
  showDeleteConfirmationModal
  =========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager
    };

    this.onPlateSizeClick = this.onPlateSizeClick.bind(this);
    this.onProductNameClick = this.onProductNameClick.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      isAdmin: props.isAdmin,
      isManager: props.isManager
    });
  }

  onPlateSizeClick(e) {
    const selectedPlateID = e.target.parentNode.parentNode.parentNode.id;
    this.props.showPlateDetailView(selectedPlateID);
  }

  onProductNameClick(e) {
    const selectedProductID = e.target.parentNode.id;
    this.props.showProductDetailView(selectedProductID);
  }

  onEditClick(e) {
    const selectedPlateID = this.getPlateID(e.target);
    this.props.showPlateModal(selectedPlateID);
  }

  onDeleteClick(e) {
    const selectedPlateID = this.getPlateID(e.target);
    this.props.showDeleteConfirmationModal([selectedPlateID]);
  }

  getPlateID(target) {
    if (target.tagName === 'SPAN') {
      return target.parentNode.parentNode.parentNode.id;
    } else if (target.tagName === 'BUTTON') {
      return target.parentNode.parentNode.id;
    }
  }

  getForProductList() {
    const plate = this.props.plate;
    return plate.forProductList.map(({ productID, printContent }) => {
      const product = this.props.productsData.find(
        product => product._id === productID
      );
      const productSize = `
        ${product.thick} x ${product.length} x ${product.width}
      `;

      return (
        <div
          id={product._id}
          key={product._id}
          className="plate-list-item__forProductListItem"
        >
          <a onClick={this.onProductNameClick}>{product.name}</a>
          <span>{productSize}</span>
          <span>{printContent}</span>
        </div>
      );
    });
  }

  render() {
    const plate = this.props.plate;

    return (
      <li className="plate" key={plate._id} id={plate._id}>
        {this.state.isAdmin || this.state.isManager ? (
        <div className="plate-list-item__checkbox-container">
          <Checkbox
            name={plate._id}
            onInputChange={this.props.onCheckboxChange}
          />
        </div>
        ): undefined}
        <div className="plate-list-item__container">
          <div className="plate-list-item__size-container">
            <a
              className="plate-list-item__plateSize"
              onClick={this.onPlateSizeClick}
            >
              {plate.round} x {plate.length}
            </a>
          </div>
          <div className="plate-list-item__forProductList-container">
            {this.getForProductList()}
          </div>
        </div>

        {this.state.isAdmin || this.state.isManager ? (
          <div className="plate-list-item__buttons-container">
            <button
              className="button button-with-icon-span plate-list-item__button"
              onClick={this.onEditClick}
            >
              <i className="fa fa-edit fa-lg" />
              <span>수정</span>
            </button>
            <button
              className="button button-with-icon-span plate-list-item__button"
              onClick={this.onDeleteClick}
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
