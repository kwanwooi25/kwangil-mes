import React from 'react';

import AccountModal from './AccountModal';
import AccountList from './AccountList';

export default class AccountsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      isManager: false,
      isModalNewOpen: false
    };

    this.onClickNew = this.onClickNew.bind(this);
    this.onClickNewMulti = this.onClickNewMulti.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
  }

  componentDidMount() {
    // dynamically adjust height
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
    const pageContent = document.querySelector('.page-content');
    const mainY = headerHeight + 50;
    const mainHeight = `calc(100vh - ${mainY}px)`;
    const contentHeight = `calc(100vh - ${mainY + 50}px)`;
    main.style.height = mainHeight;
    main.style.marginTop = `${headerHeight + 10}px`;
    pageContent.style.height = contentHeight;
  }

  onClickNew() {
    this.setState({ isModalNewOpen: true });
  }

  onClickNewMulti() {
    console.log('onClickNewMulti');
  }

  onModalClose() {
    this.setState({ isModalNewOpen: false });
  }

  render() {
    return (
      <div className="main">
        <div className="page-header">
          <h1 className="page-header__title">거래처목록</h1>
          {this.state.isAdmin || this.state.isManager ? (
            <div className="page-header__buttons">
              {this.state.isAdmin ? (
                <button
                  className="page-header__button"
                  onClick={this.onClickNewMulti}
                >
                  <i className="fa fa-plus-square fa-2x" />
                  <span>대량등록</span>
                </button>
              ) : (
                undefined
              )}

              <button className="page-header__button" onClick={this.onClickNew}>
                <i className="fa fa-plus fa-lg" />
                <span>신규</span>
              </button>
            </div>
          ) : (
            undefined
          )}
        </div>

        {this.state.isModalNewOpen ? (
          <AccountModal
            isOpen={this.state.isModalNewOpen}
            onModalClose={this.onModalClose}
          />
        ) : (
          undefined
        )}

        <div className="page-content">
          <AccountList />
        </div>
      </div>
    );
  }
}
