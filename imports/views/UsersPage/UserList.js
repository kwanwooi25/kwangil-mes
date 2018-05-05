import React from 'react';

import Spinner from '../../custom/Spinner';
import UserListItem from './UserListItem';
import UserModal from './UserModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class UserList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter account list
  usersData
  isDataReady
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isUserModalOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedUserID: '',
      selectedUsername: '',
      editFor: ''
    };

    this.showUserModal = this.showUserModal.bind(this);
    this.hideUserModal = this.hideUserModal.bind(this);
    this.showDeleteConfirmationModal = this.showDeleteConfirmationModal.bind(
      this
    );
    this.hideDeleteConfirmationModal = this.hideDeleteConfirmationModal.bind(
      this
    );
  }

  showUserModal(selectedUserID, editFor) {
    this.setState({
      isUserModalOpen: true,
      selectedUserID,
      editFor
    });
  }

  hideUserModal() {
    this.setState({ isUserModalOpen: false, selectedUserID: '', editFor: '' });
  }

  showDeleteConfirmationModal(selectedUserID) {
    const user = this.props.usersData.find(user => user._id == selectedUserID);
    const selectedUsername = `${user.profile.displayName} (${user.username})`;

    this.setState({
      isDeleteConfirmationModalOpen: true,
      selectedUserID,
      selectedUsername
    });
  }

  hideDeleteConfirmationModal(answer) {
    this.setState({
      isDeleteConfirmationModalOpen: false,
      selectedUserID: '',
      selectedUserName: ''
    });

    if (answer) {
      Meteor.users.remove(this.state.selectedUserID);
    }
  }

  getUserList() {
    return this.props.usersData.map(user => {
      const profile = user.profile;

      let match = false;

      if (profile.displayName.toLowerCase().indexOf(this.props.query) > -1) {
        match = true;
      }

      // only show user that has matching query text
      if (match) {
        return (
          <UserListItem
            key={user._id}
            user={user}
            showUserModal={this.showUserModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        );
      }
    });
  }

  render() {
    return (
      <div className="list-container">
        <ul id="user-list" className="list">
          {this.props.isDataReady ? (
            this.getUserList(this.state.query)
          ) : (
            <Spinner />
          )}
        </ul>
        {this.state.isUserModalOpen && (
          <UserModal
            isOpen={this.state.isUserModalOpen}
            userID={this.state.selectedUserID}
            onModalClose={this.hideUserModal}
            editFor={this.state.editFor}
          />
        )}
        {/* {this.state.isDetailViewOpen ? (
          <AccountDetailView
            isOpen={this.state.isDetailViewOpen}
            accountID={this.state.selectedAccountID}
            onModalClose={this.hideAccountDetailViewModal}
          />
          ) : (
            undefined
          )}
          {this.state.isUserModalOpen ? (
          <AccountModal
            isOpen={this.state.isUserModalOpen}
            accountID={this.state.selectedAccountID}
            onModalClose={this.hideUserModal}
          />
          ) : (
            undefined
        )} */}
        {this.state.isDeleteConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="사용자 삭제"
            descriptionArray={[
              '아래 사용자를 삭제하시겠습니까?',
              this.state.selectedUsername
            ]}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        )}
      </div>
    );
  }
}
