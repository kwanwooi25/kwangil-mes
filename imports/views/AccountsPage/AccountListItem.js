import React from 'react';

export default class AccountListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  account
  showDetailViewModal
  showEditAccountModal
  showDeleteConfirmationModal
  ==========================================================================*/

  // show detail view modal
  onNameClick(e) {
    const selectedAccountID = e.target.parentNode.parentNode.parentNode.id;
    this.setState({
      isDetailViewOpen: true,
      selectedAccountID
    });
  }

  onDetailViewClose() {
    this.setState({ isDetailViewOpen: false });
  }

  // show account modal (EDIT mode)
  onEditClick(e) {
    let selectedAccountID = "";
    if (e.target.tagName === "SPAN") {
      selectedAccountID = e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === "BUTTON") {
      selectedAccountID = e.target.parentNode.parentNode.id;
    }

    this.setState({
      isAccountModalOpen: true,
      selectedAccountID
    });
  }

  onAccountModalClose() {
    this.setState({ isAccountModalOpen: false });
  }

  // show confirmation modal before delete
  onDeleteClick(e) {
    let selectedAccountID = "";
    if (e.target.tagName === "SPAN") {
      selectedAccountID = e.target.parentNode.parentNode.parentNode.id;
      selectedAccountName = e.target.parentNode.parentNode.parentNode.querySelector(
        ".account-name"
      ).textContent;
    } else if (e.target.tagName === "BUTTON") {
      selectedAccountID = e.target.parentNode.parentNode.id;
      selectedAccountName = e.target.parentNode.parentNode.querySelector(
        ".account-name"
      ).textContent;
    }

    this.setState({
      isDeleteConfirmModalOpen: true,
      selectedAccountID,
      selectedAccountName
    });
  }

  onDeleteConfirmModalClose(answer) {
    this.setState({ isDeleteConfirmModalOpen: false });

    if (answer) {
      Meteor.call("accounts.remove", this.state.selectedAccountID);
    }
  }

  render() {
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
    )
  }
}
