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

    this.props.showDetailViewModal(selectedAccountID);
  }

  // show account modal (EDIT mode)
  onEditClick(e) {
    const selectedAccountID = this.getAccountID(e);

    this.props.showEditAccountModal(selectedAccountID);
  }

  // show confirmation modal before delete
  onDeleteClick(e) {
    const selectedAccountID = this.getAccountID(e);

    this.props.showDeleteConfirmationModal(selectedAccountID);
  }

  getAccountID(e) {
    if (e.target.tagName === 'SPAN') {
      return e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'BUTTON') {
      return e.target.parentNode.parentNode.id;
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
            {account.fax ? (
              <a className="account-fax">
                <i className="fa fa-fax" /> {account.fax}
              </a>
            ) : (
              undefined
            )}
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
}
