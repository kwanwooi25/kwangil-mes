import React from 'react';

import Spinner from '../../custom/Spinner';
import UserListItem from './UserListItem';
import NoResult from '../components/NoResult';
import UserModal from './UserModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class UserList extends React.Component {
  /*=========================================================================
  >> props <<
  query
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
    let filteredUsers = [];
    this.props.usersData.map(user => {
      const displayName = user.profile.displayName;
      if (displayName.toLowerCase().indexOf(this.props.query) > -1) {
        filteredUsers.push(user);
      }
    });

    if (filteredUsers.length > 0) {
      return filteredUsers.map(user => {
        return (
          <UserListItem
            key={user._id}
            user={user}
            query={this.props.query}
            showUserModal={this.showUserModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        );
      });
    } else {
      return <NoResult />;
    }
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
