import React from 'react';

import Checkbox from '../../custom/Checkbox';
import ProductName from '../components/ProductName';
import PlateName from '../components/PlateName';

export default class PlateListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isSelected
  isAdmin
  isManager
  plate
  productsData
  onCheckboxChange
  showPlateModal
  showDeleteConfirmationModal
  queryObj
  =========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager
    };

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
      let productSize = '';
      if (product) {
        productSize = `${product.thick} x ${product.length} x ${product.width}`;
      } else {
        productSize = '[삭제된 품목]';
      }

      return (
        <div
          key={product ? product._id : '[삭제된 품목]'}
          className="plate-list-item__forProductListItem"
        >
          {product ? (
            <ProductName
              className="plate-list-item__forProductName"
              productID={product._id}
              productName={product.name}
              query={this.props.queryObj.productName}
            />
          ) : (
            <div className="plate-list-item__forProductName-container">
              <span className="plate-list-item__forProductName-error">
                [삭제된 품목]
              </span>
            </div>
          )}
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
        {(this.state.isAdmin || this.state.isManager) && (
          <div className="plate-list-item__checkbox-container">
            <Checkbox
              name={plate._id}
              checked={this.props.isSelected}
              onInputChange={this.props.onCheckboxChange}
            />
          </div>
        )}
        <div className="plate-list-item__container">
          <PlateName
            className="plate-list-item__plateSize"
            plateID={plate._id}
            plateRound={plate.round}
            plateLength={plate.length}
            queryRound={this.props.queryObj.round}
            queryLength={this.props.queryObj.length}
          />
          <div className="plate-list-item__forProductList-container">
            {this.getForProductList()}
          </div>
        </div>

        {(this.state.isAdmin || this.state.isManager) && (
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
        )}
      </li>
    );
  }
}
