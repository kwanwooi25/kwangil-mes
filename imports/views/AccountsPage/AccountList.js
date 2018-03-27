import React from 'react';

import { AccountsData } from '../../api/accounts';

export default class AccountList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };

    this.onEditClick = this.onEditClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  componentDidMount() {
    this.databaseTracker = Tracker.autorun(() => {
      Meteor.subscribe('accounts');
      this.setState({
        data: AccountsData.find({}, { sort: { name: 1 } }).fetch()
      });
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
  }

  onEditClick(e) {
    let selectedID = '';
    if (e.target.tagName === 'SPAN') {
      selectedID = e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'A') {
      selectedID = e.target.parentNode.parentNode.id;
    }

    console.log(selectedID);
  }

  onDeleteClick(e) {
    let selectedID = '';
    if (e.target.tagName === 'SPAN') {
      selectedID = e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'A') {
      selectedID = e.target.parentNode.parentNode.id;
    }

    console.log('delete: ', selectedID);
  }

  getAccountList() {
    return this.state.data.map(account => {
      return (
        <li className="account" key={account._id} id={account._id}>
          <div className="account-details-container">
            <div className="account-name-container">
              <a className="account-name">{account.name}</a>
            </div>
            <div className="account-contact-container">
              <a className="account-phone" href={`tel:${account.phone_1}`}>
                <i className="fa fa-phone" /> {account.phone_1}
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
          <div className="account-buttons-container">
            <a className="account-button" onClick={this.onEditClick}>
              <i className="fa fa-edit fa-lg"></i>
              <span>수정</span>
            </a>
            <a className="account-button" onClick={this.onDeleteClick}>
              <i className="fa fa-trash fa-lg"></i>
              <span>삭제</span>
            </a>
          </div>
        </li>
      );
    });
  }

  render() {
    return <ul id="account-list">{this.getAccountList()}</ul>;
  }
}
