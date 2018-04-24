import React from 'react';

import UserListItem from './UserListItem';
// import AccountDetailView from './AccountDetailView';
// import AccountModal from './AccountModal';
// import ConfirmationModal from '../components/ConfirmationModal';

export default class UserList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter account list
  usersData
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      query: props.query,
      usersData: props.usersData,
      isAccountModalOpen: false,
      isDetailViewOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedAccountID: '',
      selectedAccountName: ''
    };

    // this.showAccountDetailViewModal = this.showAccountDetailViewModal.bind(this);
    // this.hideAccountDetailViewModal = this.hideAccountDetailViewModal.bind(this);
    // this.showEditAccountModal = this.showEditAccountModal.bind(this);
    // this.hideEditAccountModal = this.hideEditAccountModal.bind(this);
    // this.showDeleteConfirmationModal = this.showDeleteConfirmationModal.bind(
    //   this
    // );
    // this.hideDeleteConfirmationModal = this.hideDeleteConfirmationModal.bind(
    //   this
    // );
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      query: props.query,
      usersData: props.usersData
    });
  }

  // showAccountDetailViewModal(selectedAccountID) {
  //   this.setState({
  //     isDetailViewOpen: true,
  //     selectedAccountID
  //   });
  // }
  //
  // hideAccountDetailViewModal() {
  //   this.setState({ isDetailViewOpen: false });
  // }
  //
  // showEditAccountModal(selectedAccountID) {
  //   this.setState({
  //     isAccountModalOpen: true,
  //     selectedAccountID
  //   });
  // }
  //
  // hideEditAccountModal() {
  //   this.setState({ isAccountModalOpen: false });
  // }
  //
  // showDeleteConfirmationModal(selectedAccountID) {
  //   const account = this.state.usersData.find(
  //     account => account._id == selectedAccountID
  //   );
  //   const selectedAccountName = account.name;
  //
  //   this.setState({
  //     isDeleteConfirmationModalOpen: true,
  //     selectedAccountID,
  //     selectedAccountName
  //   });
  // }
  //
  // hideDeleteConfirmationModal(answer) {
  //   this.setState({ isDeleteConfirmationModalOpen: false });
  //
  //   if (answer) {
  //     Meteor.call('accounts.remove', this.state.selectedAccountID);
  //   }
  // }

  getUserList(query) {
    return this.state.usersData.map(user => {
      const profile = user.profile;

      let matchQuery = false;

      if (profile.displayName.indexOf(query) > -1) {
        matchQuery = true;
      }

      if (user.profile.isAdmin) {
        matchQuery = false;
      }

      // only show user that has matching query text
      if (matchQuery) {
        return (
          <UserListItem
            key={user._id}
            user={user}
            // showAccountDetailViewModal={this.showAccountDetailViewModal}
            // showEditAccountModal={this.showEditAccountModal}
            // showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        );
      }
    });
  }

  render() {
    return (
      <ul id="user-list">
        {this.getUserList(this.state.query)}
        {/* {this.state.isDetailViewOpen ? (
          <AccountDetailView
            isOpen={this.state.isDetailViewOpen}
            accountID={this.state.selectedAccountID}
            onModalClose={this.hideAccountDetailViewModal}
          />
        ) : (
          undefined
        )}
        {this.state.isAccountModalOpen ? (
          <AccountModal
            isOpen={this.state.isAccountModalOpen}
            accountID={this.state.selectedAccountID}
            onModalClose={this.hideEditAccountModal}
          />
        ) : (
          undefined
        )}
        {this.state.isDeleteConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="거래처 삭제"
            descriptionArray={[
              '아래 업체를 삭제하시겠습니까?',
              this.state.selectedAccountName
            ]}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        ) : (
          undefined
        )} */}
      </ul>
    );
  }
}
