import React from 'react';

import AccountName from '../components/AccountName';

export default class AccountListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  account
  showAccountDetailViewModal
  showEditAccountModal
  showDeleteConfirmationModal
  query
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager
    };

    this.onEditClick = this.onEditClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  // set state on props change
  componentWillReceiveProps(props) {
    this.setState({
      isAdmin: props.isAdmin,
      isManager: props.isManager
    });
  }

  // show account modal (EDIT mode)
  onEditClick(e) {
    const selectedAccountID = this.getAccountID(e.target);

    this.props.showEditAccountModal(selectedAccountID);
  }

  // show confirmation modal before delete
  onDeleteClick(e) {
    const selectedAccountID = this.getAccountID(e.target);

    this.props.showDeleteConfirmationModal(selectedAccountID);
  }

  getAccountID(target) {
    if (target.tagName === 'SPAN') {
      return target.parentNode.parentNode.parentNode.id;
    } else if (target.tagName === 'BUTTON') {
      return target.parentNode.parentNode.id;
    }
  }

  render() {
    const account = this.props.account;
    return (
      <li className="account" key={account._id} id={account._id}>
        <div className="account-details-container">
          <AccountName
            className="account-name"
            accountID={account._id}
            accountName={account.name}
            query={this.props.query}
          />
          <div className="account-contact-container">
            {account.phone_1 && (
              <a className="link account-phone" href={`tel:${account.phone_1}`}>
                <i className="fa fa-phone" />
                <span> {account.phone_1}</span>
              </a>
            )}

            {account.fax && (
              <a className="link account-fax">
                <i className="fa fa-fax" />
                <span> {account.fax}</span>
              </a>
            )}

            {account.email_1 && (
              <a className="link account-email" href={`mailto:${account.email_1}`}>
                <i className="fa fa-envelope" />
                <span> {account.email_1}</span>
              </a>
            )}
          </div>
        </div>

        {(this.state.isAdmin || this.state.isManager) && (
          <div className="account-buttons-container">
            <button
              className="button button-with-icon-span account-button"
              onClick={this.onEditClick}
            >
              <i className="fa fa-edit fa-lg" />
              <span>수정</span>
            </button>
            <button
              className="button button-with-icon-span account-button"
              onClick={this.onDeleteClick}
            >
              <i className="fa fa-trash fa-lg" />
              <span>삭제</span>
            </button>
          </div>
        )}
      </li>
    );
  }
}
