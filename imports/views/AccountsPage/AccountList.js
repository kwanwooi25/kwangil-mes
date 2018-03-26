import React from 'react';

import { AccountsData } from '../../api/accounts';

export default class AccountList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
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

  getAccountList() {
    return this.state.data.map(account => (
      <li className="account" key={account._id}>
        <div className="account-name">
          <p>{account.name}</p>
        </div>
        <div className="account-contact">
          <p><i className="fa fa-phone"></i> {account.phone_1}</p>
          <p><i className="fa fa-envelope"></i> {account.email_1}</p>
        </div>

      </li>
    ));
  }

  render() {
    return (
      <ul id="account-list">
        {this.getAccountList()}
      </ul>
    );
  }
}
