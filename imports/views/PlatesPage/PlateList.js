import React from 'react';

import Checkbox from '../../custom/Checkbox';
import PlateListItem from './PlateListItem';
import PlateDetailView from './PlateDetailView';
import ProductDetailView from '../ProductsPage/ProductDetailView';
import PlateModal from './PlateModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class PlateList extends React.Component {
  /*=========================================================================
  >> props <<
  queryObj : query object to filter product list
  isAdmin
  isManager
  accountsData
  productsData
  platesData
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      queryObj: props.queryObj,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData,
      productsData: props.productsData,
      platesData: props.platesData,
      isPlateDetailViewOpen: false,
      isProductDetailViewOpen: false,
      isPlateModalOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedPlateID: '',
      selectedProductID:'',
      confirmationDescription: [],
      platesCount: props.platesData.length,
      isSelectedMulti: false,
      selectedPlates: []
    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.showPlateDetailView = this.showPlateDetailView.bind(this);
    this.hidePlateDetailView = this.hidePlateDetailView.bind(this);
    this.showProductDetailView = this.showProductDetailView.bind(this);
    this.hideProductDetailView = this.hideProductDetailView.bind(this);
    this.showPlateModal = this.showPlateModal.bind(this);
    this.hidePlateModal = this.hidePlateModal.bind(this);
    this.showDeleteConfirmationModal = this.showDeleteConfirmationModal.bind(
      this
    );
    this.hideDeleteConfirmationModal = this.hideDeleteConfirmationModal.bind(
      this
    );
    this.onDeleteMultiClick = this.onDeleteMultiClick.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      queryObj: props.queryObj,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData,
      productsData: props.productsData,
      platesData: props.platesData,
      platesCount: props.platesData.length
    });
  }

  onCheckboxChange(e) {
    let selectedPlates = this.state.selectedPlates;
    if (e.target.name === 'selectAll') {
      selectedPlates = [];
      const checkboxes = document.querySelectorAll(
        '#plate-list input[type="checkbox"]'
      );

      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = e.target.checked;
        if (e.target.checked) {
          selectedPlates.push(checkboxes[i].name);
        }
      }
    } else {
      selectedPlates = selectedPlates.filter(
        value => value !== e.target.name
      );
      if (e.target.checked) {
        selectedPlates.push(e.target.name);
      }
    }
    selectedPlates = selectedPlates.filter(value => value !== 'selectAll');
    if (selectedPlates.length >= 2) {
      this.setState({ isSelectedMulti: true });
    } else {
      this.setState({ isSelectedMulti: false });
    }
    this.setState({ selectedPlates });
  }

  showPlateDetailView(selectedPlateID) {
    this.setState({
      isPlateDetailViewOpen: true,
      selectedPlateID
    });
  }

  hidePlateDetailView() {
    this.setState({ isPlateDetailViewOpen: false });
  }

  showProductDetailView(selectedProductID) {
    this.setState({
      isProductDetailViewOpen: true,
      selectedProductID
    });
  }

  hideProductDetailView() {
    this.setState({ isProductDetailViewOpen: false });
  }

  // show plate modal (EDIT mode)
  showPlateModal(selectedPlateID) {
    this.setState({
      isPlateModalOpen: true,
      selectedPlateID
    });
  }

  hidePlateModal() {
    this.setState({ isPlateModalOpen: false });
  }

  // show confirmation modal before delete
  showDeleteConfirmationModal(selectedPlates) {
    let confirmationDescription = [`${selectedPlates.length}개 동판 삭제하시겠습니까?`];

    selectedPlates.map(plateID => {
      const plate = this.state.platesData.find(plate => plate._id === plateID);
      let plateInfoText = `${plate.round} x ${plate.length}`;

      confirmationDescription.push(plateInfoText);
    });

    this.setState({
      isDeleteConfirmationModalOpen: true,
      selectedPlates,
      confirmationDescription
    });
  }

  hideDeleteConfirmationModal(answer) {
    this.setState({ isDeleteConfirmationModalOpen: false });

    if (answer) {
      this.state.selectedPlates.map(plateID => {
        Meteor.call('plates.remove', plateID);
      });
    }
  }

  onDeleteMultiClick() {
    this.showDeleteConfirmationModal(this.state.selectedPlates);
  }

  getProductList(queryObj) {
    return this.state.platesData.map(plate => {

      // store product names in an array
      const productNames = [];
      plate.forProductList.map(({ productID }) => {
        const product = this.state.productsData.find(
          product => product._id === productID
        );
        productNames.push(product.name);
      });

      let matchQuery = false;
      let matchProductNameQuery = false;
      let matchRoundQuery = false;
      let matchLengthQuery = false;

      // return true if any of product names contain query text
      productNames.forEach(productName => {
        if (productName.indexOf(queryObj.productName) > -1) {
          matchProductNameQuery = true;
        }
      });

      if (plate.round.indexOf(queryObj.round) > -1) {
        matchRoundQuery = true;
      }
      if (plate.length.indexOf(queryObj.length) > -1) {
        matchLengthQuery = true;
      }

      if (matchProductNameQuery && matchRoundQuery && matchLengthQuery) {
        matchQuery = true;
      }

      // only show product that has matching query text
      if (matchQuery) {
        return (
          <PlateListItem
            key={plate._id}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            plate={plate}
            productsData={this.state.productsData}
            onCheckboxChange={this.onCheckboxChange}
            showPlateDetailView={this.showPlateDetailView}
            showProductDetailView={this.showProductDetailView}
            showPlateModal={this.showPlateModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        );
      }
    });
  }

  render() {
    return (
      <ul id="plate-list">
        {this.state.platesCount &&
          (this.state.isAdmin || this.state.isManager) ? (
            <div className="plate-list-header">
              <Checkbox
                name="selectAll"
                label="전체선택"
                onInputChange={this.onCheckboxChange}
              />
              <div className="plate-buttons-container">
                <button
                  className="button button-with-icon-span plate-list-item__button"
                  onClick={this.onDeleteMultiClick}
                  disabled={!this.state.isSelectedMulti}
                >
                  <i className="fa fa-trash fa-lg" />
                  <span>삭제</span>
                </button>
              </div>
            </div>
          ) : (
            undefined
          )}

        {this.getProductList(this.state.queryObj)}

        {this.state.isPlateDetailViewOpen ? (
          <PlateDetailView
            isOpen={this.state.isPlateDetailViewOpen}
            plateID={this.state.selectedPlateID}
            onModalClose={this.hidePlateDetailView}
          />
        ) : (
          undefined
        )}

        {this.state.isProductDetailViewOpen ? (
          <ProductDetailView
            isOpen={this.state.isProductDetailViewOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.hideProductDetailView}
          />
        ) : (
          undefined
        )}

        {this.state.isPlateModalOpen ? (
          <PlateModal
            isOpen={this.state.isPlateModalOpen}
            plateID={this.state.selectedPlateID}
            onModalClose={this.hidePlateModal}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        ) : (
          undefined
        )}

        {this.state.isDeleteConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="동판 삭제"
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        ) : (
          undefined
        )}
      </ul>
    );
  }
}
