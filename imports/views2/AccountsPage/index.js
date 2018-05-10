import React from 'react';

import { setLayout } from '../../api/setLayout';
import { AccountsData } from '../../api/accounts';

import PageHeaderSearch from '../components/PageHeaderSearch';
import AccountPageHeaderButtons from './AccountPageHeaderButtons';
import AccountList from './AccountList';

export default class AccountsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      isDataReady: false,
      accountsData: [],
      filteredAccountsData: [],
      query: ''
    };

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    setLayout(30);
    window.addEventListener('resize', () => {
      setLayout(30);
    });

    // subscribe to data
    subsCache = new SubsCache(-1, -1);
    subsCache.subscribe('accounts');

    this.tracker = Tracker.autorun(() => {
      if (Meteor.user()) {
        const isDataReady = subsCache.ready();
        const accountsData = AccountsData.find().fetch();
        this.setState({
          isAdmin: Meteor.user().profile.isAdmin,
          isManager: Meteor.user().profile.isManager,
          isDataReady,
          accountsData
        }, () => { this.filterData() });
      }
    });
  }

  componentWillUnmount() {
    this.tracker.stop();
  }

  onInputSearchChange(query) {
    this.setState({ query }, () => {
      this.filterData();
    });
  }

  filterData() {
    let filteredAccountsData = [];

    // filter data
    this.state.accountsData.map(account => {
      let match = false;
      if (
        account &&
        account.name.toLowerCase().indexOf(this.state.query) > -1
      ) {
        match = true;
      }

      if (match) filteredAccountsData.push(account);
    });

    this.setState({ filteredAccountsData });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">거래처목록</h1>

            <PageHeaderSearch onInputSearchChange={this.onInputSearchChange} />

            <AccountPageHeaderButtons
              isAdmin={this.state.isAdmin}
              isManager={this.state.isManager}
              filteredAccountsData={this.state.filteredAccountsData}
            />
          </div>
        </div>

        <div className="page-content">
          <AccountList
            query={this.state.query}
            isAdmin={this.state.isAdmin}
            isManager={this.state.isManager}
            filteredAccountsData={this.state.filteredAccountsData}
            isDataReady={this.state.isDataReady}
          />
        </div>
      </div>
    );
  }
}
