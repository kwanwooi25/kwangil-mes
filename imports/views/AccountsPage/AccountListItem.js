import React from 'react';

export default class AccountListItem extends React.Component {
  /*=========================================================================
  >> props <<
  isAdmin
  isManager
  account
  showAccountDetailViewModal
  showEditAccountModal
  showDeleteConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager
    };

    this.onNameClick = this.onNameClick.bind(this);
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

  // show detail view modal
  onNameClick(e) {
    const selectedAccountID = e.target.parentNode.parentNode.parentNode.id;

    this.props.showAccountDetailViewModal(selectedAccountID);
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
          <div className="account-name-container">
            <a className="account-name" onClick={this.onNameClick}>
              {account.name}
            </a>
          </div>
          <div className="account-contact-container">
            <a className="account-phone" href={`tel:${account.phone_1}`}>
              <i className="fa fa-phone" /> {account.phone_1}
            </a>
            <a className="account-fax">
              {account.fax ? <i className="fa fa-fax" /> : undefined}
              {account.fax}
            </a>
            {account.email_1 ? (
              <a className="account-email" href={`mailto:${account.email_1}`}>
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
        ) : (
          undefined
        )}
      </li>
    );
  }
}
