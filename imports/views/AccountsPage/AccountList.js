import React from 'react';

import Spinner from '../../custom/Spinner';
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
  isDataReady
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      query: props.query,
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      accountsData: props.accountsData,
      isDataReady: props.isDataReady,
      itemsToShow: 9999,
      isAccountModalOpen: false,
      isDetailViewOpen: false,
      isDeleteConfirmationModalOpen: false,
      selectedAccountID: '',
      selectedAccountName: ''
    };

    this.onListScroll = this.onListScroll.bind(this);
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
      accountsData: props.accountsData,
      isDataReady: props.isDataReady
    });
  }

  onListScroll(e) {
    const list = e.target;
    console.log('account-list scrolling...');
    if (list.scrollTop + list.clientHeight >= list.scrollHeight) {
      let itemsToShow = this.state.itemsToShow;
      itemsToShow += 20;
      this.setState({ itemsToShow }, () => {
        this.getAccountList(this.state.query);
      });
    }
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
    let filteredAccountsData = [];

    // filter data
    this.state.accountsData.map(account => {
      let matchQuery = false;
      for (let key in account) {
        if (key !== '_id' && account[key].indexOf(query) > -1) {
          matchQuery = true;
        }
      }

      if (matchQuery) filteredAccountsData.push(account);
    });

    // render filtered accounts
    return filteredAccountsData
      .slice(0, this.state.itemsToShow)
      .map(account => {
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
      });
  }

  render() {
    return (
      <div className="list-container">
        <ul id="account-list" className="list" onScroll={this.onListScroll}>
          {this.state.isDataReady ? (
            this.getAccountList(this.state.query)
          ) : (
            <Spinner />
          )}
        </ul>

        {this.state.isAccountModalOpen && (
          <AccountModal
            isOpen={this.state.isAccountModalOpen}
            accountID={this.state.selectedAccountID}
            onModalClose={this.hideEditAccountModal}
          />
        )}

        {this.state.isDeleteConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmationModalOpen}
            title="거래처 삭제"
            descriptionArray={[
              '아래 업체를 삭제하시겠습니까?',
              this.state.selectedAccountName
            ]}
            onModalClose={this.hideDeleteConfirmationModal}
          />
        )}
      </div>
    );
  }
}
