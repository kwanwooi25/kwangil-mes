import React from 'react';

import PageHeaderSearch from '../components/PageHeaderSearch';
import UserPageHeaderButtons from './UserPageHeaderButtons';
import UserList from './UserList';

export default class UsersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      usersData: []
    };

    this.onInputSearchChange = this.onInputSearchChange.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
    this.setLayout();
    window.addEventListener('resize', () => {
      this.setLayout();
    });

    // tracks data change
    this.databaseTracker = Tracker.autorun(() => {
      Meteor.subscribe('users');
      this.setState({
        usersData: Meteor.users.find().fetch()
      });
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
  }

  // dynamically adjust height
  setLayout() {
    const headerHeight = document
      .querySelector('.header')
      .getBoundingClientRect().height;
    const pageHeaderHeight = document
      .querySelector('.page-header')
      .getBoundingClientRect().height;
    const main = document.querySelector('.main');
    const pageContent = document.querySelector('.page-content');
    const mainHeight = `calc(100vh - ${headerHeight + 10}px)`;
    const contentHeight = `calc(100vh - ${headerHeight +
      25 +
      pageHeaderHeight}px)`;
    main.style.height = mainHeight;
    main.style.marginTop = `${headerHeight + 5}px`;
    pageContent.style.height = contentHeight;
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
          />
        </div>
      </div>
    );
  }
}
