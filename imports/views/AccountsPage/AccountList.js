import React from 'react';

import { AccountsData } from '../../api/accounts';

import AccountDetailView from './AccountDetailView';

export default class AccountList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      query: props.query,
      isAdmin: false,
      isManager: false,
      isDetailViewOpen: false,
      seletedID: ''
    };

    this.onNameClick = this.onNameClick.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onDetailViewClose = this.onDetailViewClose.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({ query: props.query }, () => {});
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

  onEditClick(e) {
    let selectedID = '';
    if (e.target.tagName === 'SPAN') {
      selectedID = e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.tagName === 'A') {
      selectedID = e.target.parentNode.parentNode.id;
    }

    console.log('edit: ', selectedID);
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
                <a className="account-button" onClick={this.onEditClick}>
                  <i className="fa fa-edit fa-lg" />
                  <span>수정</span>
                </a>
                <a className="account-button" onClick={this.onDeleteClick}>
                  <i className="fa fa-trash fa-lg" />
                  <span>삭제</span>
                </a>
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
      </ul>
    );
  }
}
