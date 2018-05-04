import React from 'react';

import { AccountsData } from '../../api/accounts';
import { setLayout } from '../../api/setLayout';

import PageHeaderSearch from '../components/PageHeaderSearch';
import AccountPageHeaderButtons from './AccountPageHeaderButtons';
import AccountList from './AccountList';

export default class AccountsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      query: '',
      accountsData: [],
      filteredAccountsData: [],
      isDataReady: false
    };

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    setLayout(30);
    window.addEventListener('resize', () => {
      setLayout(30);
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

    const subsCache = new SubsCache(-1, -1);
    subsCache.subscribe('accounts');

    // tracks data change
    Tracker.autorun(() => {
      const isDataReady = subsCache.ready();
      const accountsData = AccountsData.find({}, { sort: { name: 1 } }).fetch();

      this.setState({ accountsData, isDataReady }, () => {
        this.filterData();
      });
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
  }

  onInputSearchChange(query) {
    this.setState({ query }, () => { this.filterData() });
  }

  filterData() {
    let filteredAccountsData = [];

    // filter data
    this.state.accountsData.map(account => {
      let matchQuery = false;
      for (let key in account) {
        if (
          key !== '_id' &&
          (account[key] && account[key].toLowerCase().indexOf(this.state.query) > -1)
        ) {
          matchQuery = true;
        }
      }

      if (matchQuery) filteredAccountsData.push(account);
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
