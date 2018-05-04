import React from 'react';

import Spinner from '../../custom/Spinner';
import Checkbox from '../../custom/Checkbox';
import PlateListItem from './PlateListItem';
import PlateModal from './PlateModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class PlateList extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  productsData
  filteredPlatesData
  isDataReady
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      itemsToShow: 20,
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

  onListScroll(e) {
    const list = e.target;
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
      const plate = this.props.filteredPlatesData.find(plate => plate._id === plateID);
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
      this.props.selectedPlates.map(plateID => {
        Meteor.call('plates.remove', plateID);
      });

      // reset checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }

      // reset selectedPlates array
      this.setState({ selectedPlates: [] });
    }
  }

  onDeleteMultiClick() {
    this.showDeleteConfirmationModal(this.state.selectedPlates);
  }

  getPlateList() {
    return this.props.filteredPlatesData.slice(0, this.state.itemsToShow).map(plate => {
      return (
        <PlateListItem
          key={plate._id}
          isAdmin={this.props.isAdmin}
          isManager={this.props.isManager}
          plate={plate}
          productsData={this.props.productsData}
          onCheckboxChange={this.onCheckboxChange}
          showPlateModal={this.showPlateModal}
          showDeleteConfirmationModal={this.showDeleteConfirmationModal}
        />
      );
    })
  }

  render() {
    return (
      <div className="list-container">
        {(this.props.isAdmin || this.props.isManager) && (
          <div className="list-header">
            <Checkbox
              name="selectAll"
              label="전체선택"
              onInputChange={this.onCheckboxChange}
            />
            <div className="list-header-buttons-container">
              <button
                className="button button-with-icon-span list-header-button"
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
          {this.props.isDataReady ? (
            this.getPlateList()
          ) : (
            <Spinner />
          )}
        </ul>

        {this.state.isPlateModalOpen && (
          <PlateModal
            isOpen={this.state.isPlateModalOpen}
            plateID={this.state.selectedPlateID}
            onModalClose={this.hidePlateModal}
            isAdmin={this.props.isAdmin}
            isManager={this.props.isManager}
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
