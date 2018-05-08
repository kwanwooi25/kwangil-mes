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
  platesData
  filteredPlatesData
  isDataReady
  queryObj
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      queryObj: props.queryObj,
      filteredPlatesData: props.filteredPlatesData,
      itemsToShow: 20,
      isPlateModalOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedPlateID: '',
      confirmationDescription: [],
      selectedPlates: Session.get('selectedPlates') || []
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

  componentWillReceiveProps(props) {
    this.setState({
      filteredPlatesData: props.filteredPlatesData,
      queryObj: props.queryObj
    });
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

    this.setState({ selectedPlates }, () => {
      Session.set('selectedPlates', selectedPlates);
    });
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
      const plate = this.props.platesData.find(plate => plate._id === plateID);
      let plateInfoText = `${plate.round} x ${plate.length}`;

      confirmationDescription.push(plateInfoText);
    });

    this.setState(
      {
        isDeleteConfirmationModalOpen: true,
        selectedPlates,
        confirmationDescription
      },
      () => {
        Session.set('selectedPlates', selectedPlates);
      }
    );
  }

  hideDeleteConfirmationModal(answer) {
    this.setState({ isDeleteConfirmationModalOpen: false });

    if (answer) {
      this.state.selectedPlates.map(plateID => {
        Meteor.call('plates.remove', plateID);
      });

      // reset checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }

      // reset selectedPlates array
      this.setState({ selectedPlates: [] }, () => {
        Session.set('selectedPlates', []);
      });
    }
  }

  onDeleteMultiClick() {
    this.showDeleteConfirmationModal(Session.get('selectedPlates'));
  }

  getPlateList() {
    return this.state.filteredPlatesData
      .slice(0, this.state.itemsToShow)
      .map(plate => {
        const selectedPlates = this.state.selectedPlates;
        let isSelected = false;
        if (selectedPlates) {
          selectedPlates.map(plateID => {
            if (plate._id === plateID) {
              isSelected = true;
            }
          });
        }

        return (
          <PlateListItem
            key={plate._id}
            isSelected={isSelected}
            isAdmin={this.props.isAdmin}
            isManager={this.props.isManager}
            plate={plate}
            productsData={this.props.productsData}
            onCheckboxChange={this.onCheckboxChange}
            showPlateModal={this.showPlateModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
            queryObj={this.state.queryObj}
          />
        );
      });
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
                disabled={this.state.selectedPlates.length <= 1}
              >
                <i className="fa fa-trash fa-lg" />
                <span>삭제</span>
              </button>
            </div>
          </div>
        )}

        <ul id="plate-list" className="list" onScroll={this.onListScroll}>
          {this.props.isDataReady ? this.getPlateList() : <Spinner />}
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
