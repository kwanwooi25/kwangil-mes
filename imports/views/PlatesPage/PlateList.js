import React from 'react';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { PlatesData } from '../../api/plates';

import Checkbox from '../../custom/Checkbox';
import PlateListItem from './PlateListItem';
// import AccountDetailView from '../AccountsPage/AccountDetailView';
// import ProductDetailView from './ProductDetailView';
// import ProductOrderModal from './ProductOrderModal';
// import ProductModal from './ProductModal';
// import ConfirmationModal from '../components/ConfirmationModal';

export default class ProductList extends React.Component {
  /*=========================================================================
  >> props <<
  queryObj : query object to filter product list
  isAdmin
  isManager
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      // accountList: [],
      platesData: [],
      queryObj: props.queryObj,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      // isAccountDetailViewOpen: false,
      // isProductOrderModalOpen: false,
      // isProductModalOpen: false,
      // isProductDetailViewOpen: false,
      // isDeleteConfirmationModalOpen: false,
      // selectedProductID: '',
      // confirmationDescription: [],
      platesCount: 0,
      isSelectedMulti: false,
      selectedPlates: []
    };

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    // this.showAccountDetailView = this.showAccountDetailView.bind(this);
    // this.hideAccountDetailView = this.hideAccountDetailView.bind(this);
    // this.showProductDetailView = this.showProductDetailView.bind(this);
    // this.hideProductDetailView = this.hideProductDetailView.bind(this);
    // this.showProductOrderModal = this.showProductOrderModal.bind(this);
    // this.hideProductOrderModal = this.hideProductOrderModal.bind(this);
    // this.showProductModal = this.showProductModal.bind(this);
    // this.hideProductModal = this.hideProductModal.bind(this);
    // this.showDeleteConfirmationModal = this.showDeleteConfirmationModal.bind(
    //   this
    // );
    // this.hideDeleteConfirmationModal = this.hideDeleteConfirmationModal.bind(
    //   this
    // );
    // this.onDeleteMultiClick = this.onDeleteMultiClick.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      queryObj: props.queryObj,
      isAdmin: props.isAdmin,
      isManager: props.isManager
    });
  }

  componentDidMount() {
    // tracks data change
    this.databaseTracker = Tracker.autorun(() => {
      Meteor.subscribe('plates');
      const plateList = PlatesData.find({}, { sort: { name: 1 } }).fetch();

      this.setState({
        platesData: plateList,
        platesCount: plateList.length
      });
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
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

  // showAccountDetailView(selectedAccountID) {
  //   this.setState({
  //     isAccountDetailViewOpen: true,
  //     selectedAccountID
  //   });
  // }
  //
  // hideAccountDetailView() {
  //   this.setState({ isAccountDetailViewOpen: false });
  // }
  //
  // showProductDetailView(selectedProductID) {
  //   this.setState({
  //     isProductDetailViewOpen: true,
  //     selectedProductID
  //   });
  // }
  //
  // hideProductDetailView() {
  //   this.setState({ isProductDetailViewOpen: false });
  // }
  //
  // // show product order modal
  // showProductOrderModal(selectedProductID) {
  //   this.setState({
  //     isProductOrderModalOpen: true,
  //     selectedProductID
  //   });
  // }
  //
  // hideProductOrderModal() {
  //   this.setState({ isProductOrderModalOpen: false });
  // }
  //
  // // show account modal (EDIT mode)
  // showProductModal(selectedProductID) {
  //   this.setState({
  //     isProductModalOpen: true,
  //     selectedProductID
  //   });
  // }
  //
  // hideProductModal() {
  //   this.setState({ isProductModalOpen: false });
  // }
  //
  // // show confirmation modal before delete
  // showDeleteConfirmationModal(selectedPlates) {
  //   let confirmationDescription = [`
  //     ${selectedPlates.length}개 품목 삭제하시겠습니까?
  //     `];
  //
  //   selectedPlates.map(productID => {
  //     const product = ProductsData.findOne({ _id: productID });
  //     let productInfoText = `
  //         ${product.name} (${product.thick}x${product.length}x${product.width})
  //       `;
  //     confirmationDescription.push(productInfoText);
  //   });
  //
  //   this.setState({
  //     isDeleteConfirmationModalOpen: true,
  //     selectedPlates,
  //     confirmationDescription
  //   });
  // }
  //
  // hideDeleteConfirmationModal(answer) {
  //   this.setState({ isDeleteConfirmationModalOpen: false });
  //
  //   if (answer) {
  //     this.state.selectedPlates.map(productID => {
  //       Meteor.call('products.remove', productID);
  //     });
  //   }
  // }
  //
  // onDeleteMultiClick() {
  //   this.showDeleteConfirmationModal(this.state.selectedPlates);
  // }

  getProductList(queryObj) {
    return this.state.platesData.map(plate => {

      let matchQuery = true;

      // only show product that has matching query text
      if (matchQuery) {
        return (
          <PlateListItem
            key={plate._id}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            plate={plate}
            // product={product}
            onCheckboxChange={this.onCheckboxChange}
            // showAccountDetailView={this.showAccountDetailView}
            // showProductDetailView={this.showProductDetailView}
            // showProductOrderModal={this.showProductOrderModal}
            // showProductModal={this.showProductModal}
            // showDeleteConfirmationModal={this.showDeleteConfirmationModal}
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
                  className="button button-with-icon-span plate-button"
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

        {/* {this.state.isAccountDetailViewOpen ? (
          <AccountDetailView
            isOpen={this.state.isAccountDetailViewOpen}
            accountID={this.state.selectedAccountID}
            onModalClose={this.hideAccountDetailView}
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

        {this.state.isProductOrderModalOpen ? (
          <ProductOrderModal
            isOpen={this.state.isProductOrderModalOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.hideProductOrderModal}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        ) : (
          undefined
        )}

        {this.state.isProductModalOpen ? (
          <ProductModal
            isOpen={this.state.isProductModalOpen}
            productID={this.state.selectedProductID}
            onModalClose={this.hideProductModal}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        ) : (
          undefined
        )}

        {this.state.isDeleteConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="품목 삭제"
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        ) : (
          undefined
        )} */}
      </ul>
    );
  }
}
