import React from 'react';

import Spinner from '../../custom/Spinner';
import Checkbox from '../../custom/Checkbox';
import PlateListItem from './PlateListItem';
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
  isDataReady
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
      isDataReady: props.isDataReady,
      itemsToShow: 100,
      isPlateModalOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedPlateID: '',
      confirmationDescription: [],
      isSelectedMulti: false,
      selectedPlates: []
    };

    this.onListScroll = this.onListScroll.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
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
      isDataReady: props.isDataReady
    });
  }

  onListScroll(e) {
    const list = e.target;
    console.log('plate-list scrolling...');
    if (list.scrollTop + list.clientHeight >= list.scrollHeight) {
      let itemsToShow = this.state.itemsToShow;
      itemsToShow += 20;
      this.setState({ itemsToShow }, () => {
        this.getPlateList(this.state.queryObj);
      });
    }
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
      selectedPlates = selectedPlates.filter(value => value !== e.target.name);
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
    let confirmationDescription = [
      `${selectedPlates.length}개 동판 삭제하시겠습니까?`
    ];

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

  getPlateList(queryObj) {
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

      if (String(plate.round).indexOf(queryObj.round) > -1) {
        matchRoundQuery = true;
      }
      if (String(plate.length).indexOf(queryObj.length) > -1) {
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
            showPlateModal={this.showPlateModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        );
      }
    });
  }

  render() {
    return (
      <div className="list-container">
        {(this.state.isAdmin || this.state.isManager) && (
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
        )}

        <ul id="plate-list" className="list" onScroll={this.onListScroll}>
          {this.state.isDataReady ? (
            this.getPlateList(this.state.queryObj)
          ) : (
            <Spinner />
          )}
        </ul>

        {this.state.isPlateModalOpen && (
          <PlateModal
            isOpen={this.state.isPlateModalOpen}
            plateID={this.state.selectedPlateID}
            onModalClose={this.hidePlateModal}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
          />
        )}

        {this.state.isDeleteConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="동판 삭제"
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        )}
      </div>
    );
  }
}
