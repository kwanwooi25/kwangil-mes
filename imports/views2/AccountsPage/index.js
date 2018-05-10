import React from 'react';

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
      accountsData: props.accountsData,
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

    // tracks if the user logged in is admin or manager
    this.authTracker = Tracker.autorun(() => {
      if (Meteor.user()) {
        this.setState({
          isAdmin: Meteor.user().profile.isAdmin,
          isManager: Meteor.user().profile.isManager
        });
      }
    });

    this.filterData();
  }

  componentWillReceiveProps(props) {
    this.setState({ accountsData: props.accountsData }, () => {
      this.filterData();
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
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
            isDataReady={this.props.isDataReady}
          />
        </div>
      </div>
    );
  }
}
