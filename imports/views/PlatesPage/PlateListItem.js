import React from 'react';

import Checkbox from '../../custom/Checkbox';
import ProductName from '../components/ProductName';
import PlateName from '../components/PlateName';

export default class PlateListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  plate
  productsData
  onCheckboxChange
  showPlateModal
  showDeleteConfirmationModal
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
      const productSize = `${product.thick} x ${product.length} x ${product.width}`;

      return (
        <div
          key={product._id}
          className="plate-list-item__forProductListItem"
        >
          <ProductName
            className="plate-list-item__forProductName"
            productID={product._id}
            productName={product.name}
          />
          <span>{productSize}</span>
          <span>{printContent}</span>
        </div>
      );
    });
  }

  render() {
    const plate = this.props.plate;
    const plateSize = `${plate.round} x ${plate.length}`;

    return (
      <li className="plate" key={plate._id} id={plate._id}>
        {(this.state.isAdmin || this.state.isManager) && (
          <div className="plate-list-item__checkbox-container">
            <Checkbox
              name={plate._id}
              onInputChange={this.props.onCheckboxChange}
            />
          </div>
        )}
        <div className="plate-list-item__container">
          <PlateName
            className="plate-list-item__plateSize"
            plateID={plate._id}
            plateName={plateSize}
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
