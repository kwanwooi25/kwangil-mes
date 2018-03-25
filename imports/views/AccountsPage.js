import React from 'react';

import AccountModal from './components/AccountModal';

export default class AccountsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      isModalNewOpen: false
    };

    this.onClickNew = this.onClickNew.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
  }

  componentDidMount() {
    this.setLayout();
    window.addEventListener('resize', () => {
      this.setLayout();
    });

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
    this.authTracker.stop();
  }

  setLayout() {
    const headerHeight = document
      .querySelector('.header')
      .getBoundingClientRect().height;
    const main = document.querySelector('.main');
    const mainY = headerHeight + 50;
    const mainHeight = `calc(100vh - ${mainY}px)`;
    main.style.height = mainHeight;
    main.style.marginTop = `${headerHeight + 10}px`;
  }

  onClickNew() {
    this.setState({ isModalNewOpen: true });
  }

  onModalClose() {
    this.setState({ isModalNewOpen: false });
  }

  render() {
    return (
      <div className="main">
        <h1 className="page-header">업체관리</h1>
        {this.state.isAdmin || this.state.isManager ? (
          <div className="button-container">
            <button className="button" onClick={this.onClickNew}>
              업체등록
            </button>
          </div>
        ) : (
          undefined
        )}
        {this.state.isModalNewOpen ? (
          <AccountModal
            isOpen={this.state.isModalNewOpen}
            onModalClose={this.onModalClose}
          />
        ) : (
          undefined
        )}
        
        <table className="account-list" />
      </div>
    );
  }
}
