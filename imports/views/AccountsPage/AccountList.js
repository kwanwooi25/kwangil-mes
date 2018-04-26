import React from 'react';

import AccountListItem from './AccountListItem';
import AccountModal from './AccountModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class AccountList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter account list
  isAdmin
  isManager
  accountsData
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      query: props.query,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData,
      isAccountModalOpen: false,
      isDetailViewOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedAccountID: '',
      selectedAccountName: ''
    };

    this.showEditAccountModal = this.showEditAccountModal.bind(this);
    this.hideEditAccountModal = this.hideEditAccountModal.bind(this);
    this.showDeleteConfirmationModal = this.showDeleteConfirmationModal.bind(
      this
    );
    this.hideDeleteConfirmationModal = this.hideDeleteConfirmationModal.bind(
      this
    );
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      query: props.query,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData
    });
  }

  showEditAccountModal(selectedAccountID) {
    this.setState({
      isAccountModalOpen: true,
      selectedAccountID
    });
  }

  hideEditAccountModal() {
    this.setState({ isAccountModalOpen: false });
  }

  showDeleteConfirmationModal(selectedAccountID) {
    const account = this.state.accountsData.find(
      account => account._id == selectedAccountID
    );
    const selectedAccountName = account.name;

    this.setState({
      isDeleteConfirmationModalOpen: true,
      selectedAccountID,
      selectedAccountName
    });
  }

  hideDeleteConfirmationModal(answer) {
    this.setState({ isDeleteConfirmationModalOpen: false });

    if (answer) {
      Meteor.call('accounts.remove', this.state.selectedAccountID);
    }
  }

  getAccountList(query) {
    return this.state.accountsData.map(account => {
      let matchQuery = false;
      for (let key in account) {
        if (key !== '_id' && account[key].indexOf(query) > -1) {
          matchQuery = true;
        }
      }

      // only show account that has matching query text
      if (matchQuery) {
        return (
          <AccountListItem
            key={account._id}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            account={account}
            showAccountDetailViewModal={this.showAccountDetailViewModal}
            showEditAccountModal={this.showEditAccountModal}
            showDeleteConfirmationModal={this.showDeleteConfirmationModal}
          />
        );
      }
    });
  }

  render() {
    return (
      <div className="list-container">
        <ul id="account-list" className="list">
          {this.getAccountList(this.state.query)}
        </ul>

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
        )}
      </div>
    );
  }
}
