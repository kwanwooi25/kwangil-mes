import React from 'react';

import { AccountsData } from '../../api/accounts';

import AccountDetailView from './AccountDetailView';
import AccountModal from './AccountModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class AccountList extends React.Component {
  /*=========================================================================
  >> props <<
  query : query string to filter account list
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      query: props.query,
      isAdmin: false,
      isManager: false,
      isAccountModalOpen: false,
      isDetailViewOpen: false,
      isDeleteConfirmModalOpen: false,
      selectedID: '',
      selectedName: ''
    };

    this.onNameClick = this.onNameClick.bind(this);
    this.onDetailViewClose = this.onDetailViewClose.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onAccountModalClose = this.onAccountModalClose.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onDeleteConfirmModalClose = this.onDeleteConfirmModalClose.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({ query: props.query });
  }

  componentDidMount() {
    // tracks data change
    this.databaseTracker = Tracker.autorun(() => {
      Meteor.subscribe('accounts');
      this.setState({
        data: AccountsData.find({}, { sort: { name: 1 } }).fetch()
      });
    });

    // tracks if the user logged in is admin or manager
    this.authTracker = Tracker.autorun(() => {
      if (Meteor.user()) {
        this.setState({
          isAdmin: Meteor.user().profile.isAdmin,
          isManager: Meteor.user().profile.isManager
        });
      }
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
    this.authTracker.stop();
  }

  // show detail view modal
  onNameClick(e) {
    const selectedID = e.target.parentNode.parentNode.parentNode.id;
    this.setState({
      isDetailViewOpen: true,
      selectedID
    });
  }

  onDetailViewClose() {
    this.setState({ isDetailViewOpen: false });
  }

  // show account modal (EDIT mode)
  onEditClick(e) {
    let selectedID = '';
    if (e.target.tagName === 'SPAN') {
      selectedID = e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'A') {
      selectedID = e.target.parentNode.parentNode.id;
    }

    this.setState({
      isAccountModalOpen: true,
      selectedID
    });
  }

  onAccountModalClose() {
    this.setState({ isAccountModalOpen: false });
  }

  // show confirmation modal before delete
  onDeleteClick(e) {
    let selectedID = '';
    if (e.target.tagName === 'SPAN') {
      selectedID = e.target.parentNode.parentNode.parentNode.id;
      selectedName = e.target.parentNode.parentNode.parentNode.querySelector(
        '.account-name'
      ).textContent;
    } else if (e.target.tagName === 'A') {
      selectedID = e.target.parentNode.parentNode.id;
      selectedName = e.target.parentNode.parentNode.querySelector(
        '.account-name'
      ).textContent;
    }

    this.setState({
      isDeleteConfirmModalOpen: true,
      selectedID,
      selectedName
    });
  }

  onDeleteConfirmModalClose(answer) {
    this.setState({ isDeleteConfirmModalOpen: false });

    if (answer) {
      Meteor.call('accounts.remove', this.state.selectedID);
    }
  }

  getAccountList(query) {
    return this.state.data.map(account => {
      let matchQuery = false;
      for (let key in account) {
        if (key !== '_id' && account[key].indexOf(query) > -1) {
          matchQuery = true;
        }
      }

      // only show account that has matching query text
      if (matchQuery) {
        return (
          <li className="account" key={account._id} id={account._id}>
            <div className="account-details-container">
              <div className="account-name-container">
                <a className="account-name" onClick={this.onNameClick}>
                  {account.name}
                </a>
              </div>
              <div className="account-contact-container">
                <a className="account-phone" href={`tel:${account.phone_1}`}>
                  <i className="fa fa-phone" /> {account.phone_1}
                </a>
                {account.fax ? (
                  <a className="account-fax">
                    <i className="fa fa-fax" /> {account.fax}
                  </a>
                ) : (
                  undefined
                )}
                {account.email_1 ? (
                  <a
                    className="account-email"
                    href={`mailto:${account.email_1}`}
                  >
                    <i className="fa fa-envelope" /> {account.email_1}
                  </a>
                ) : (
                  undefined
                )}
              </div>
            </div>

            {this.state.isAdmin || this.state.isManager ? (
              <div className="account-buttons-container">
                <button
                  className="button-circle account-button"
                  onClick={this.onEditClick}
                >
                  <i className="fa fa-edit fa-lg" />
                  <span>수정</span>
                </button>
                <button
                  className="button-circle account-button"
                  onClick={this.onDeleteClick}
                >
                  <i className="fa fa-trash fa-lg" />
                  <span>삭제</span>
                </button>
              </div>
            ) : (
              undefined
            )}
          </li>
        );
      }
    });
  }

  render() {
    return (
      <ul id="account-list">
        {this.getAccountList(this.state.query)}
        {this.state.isDetailViewOpen ? (
          <AccountDetailView
            isOpen={this.state.isDetailViewOpen}
            selectedID={this.state.selectedID}
            onDetailViewClose={this.onDetailViewClose}
          />
        ) : (
          undefined
        )}
        {this.state.isAccountModalOpen ? (
          <AccountModal
            isOpen={this.state.isAccountModalOpen}
            selectedID={this.state.selectedID}
            onModalClose={this.onAccountModalClose}
          />
        ) : (
          undefined
        )}
        {this.state.isDeleteConfirmModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isDeleteConfirmModalOpen}
            title="거래처 삭제"
            description={`[${
              this.state.selectedName
            }] 업체를 삭제하시겠습니까?`}
            onModalClose={this.onDeleteConfirmModalClose}
          />
        ) : (
          undefined
        )}
      </ul>
    );
  }
}
