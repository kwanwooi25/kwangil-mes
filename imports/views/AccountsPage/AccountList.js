import React from 'react';

import Spinner from '../../custom/Spinner';
import AccountListItem from './AccountListItem';
import NoResult from '../components/NoResult';
import AccountModal from './AccountModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class AccountList extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  filteredAccountsData
  isDataReady
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      query: props.query,
      filteredAccountsData: props.filteredAccountsData,
      itemsToShow: 20,
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

  componentWillReceiveProps(props) {
    this.setState({
      query: props.query,
      filteredAccountsData: props.filteredAccountsData
    });
  }

  onListScroll(e) {
    const list = e.target;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight) {
      let itemsToShow = this.state.itemsToShow;
      itemsToShow += 20;
      this.setState({ itemsToShow }, () => {
        this.getAccountList();
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
    const account = this.state.filteredAccountsData.find(
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

  getAccountList() {
    if (this.state.filteredAccountsData.length > 0) {
      return this.state.filteredAccountsData
        .slice(0, this.state.itemsToShow)
        .map(account => {
          return (
              <AccountListItem
                key={account._id}
                isAdmin={this.props.isAdmin}
                isManager={this.props.isManager}
                account={account}
                showAccountDetailViewModal={this.showAccountDetailViewModal}
                showEditAccountModal={this.showEditAccountModal}
                showDeleteConfirmationModal={this.showDeleteConfirmationModal}
                query={this.state.query}
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
        <ul id="account-list" className="list" onScroll={this.onListScroll}>
          {this.props.isDataReady ? this.getAccountList() : <Spinner />}
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
