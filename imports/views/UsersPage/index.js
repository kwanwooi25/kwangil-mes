import React from 'react';

import { subsCache } from '../../../client/main';

import { setLayout } from '../../api/setLayout';

import PageHeaderSearch from '../components/PageHeaderSearch';
import UserPageHeaderButtons from './UserPageHeaderButtons';
import UserList from './UserList';

export default class UsersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      usersData: [],
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

    // tracks data change
    this.databaseTracker = Tracker.autorun(() => {
      const isDataReady = subsCache.ready();
      const usersData = Meteor.users.find().fetch();
      this.setState({ usersData, isDataReady });
    });
  }

  onInputSearchChange(query) {
    this.setState({ query });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <div className="page-header__row">
            <h1 className="page-header__title">사용자목록</h1>
            <PageHeaderSearch onInputSearchChange={this.onInputSearchChange} />
            <UserPageHeaderButtons />
          </div>
        </div>

        <div className="page-content">
          <UserList
            query={this.state.query}
            usersData={this.state.usersData}
            isDataReady={this.state.isDataReady}
          />
        </div>
      </div>
    );
  }
}
