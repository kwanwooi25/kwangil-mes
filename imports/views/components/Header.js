import React from 'react';
import { NavLink } from 'react-router-dom';
import { Accounts } from 'meteor/accounts-base';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      displayName: ''
    }

    this.onNavToggle = this.onNavToggle.bind(this);
    this.closeNav = this.closeNav.bind(this);
  }

  componentDidMount() {
    // tracks if the user logged in is admin or manager
    this.authTracker = Tracker.autorun(() => {
      if (Meteor.user()) {
        this.setState({
          isAdmin: Meteor.user().profile.isAdmin,
          displayName: Meteor.user().profile.displayName
        });
      }
    });
  }

  componentWillUnmount() {
    this.authTracker.stop();
  }

  onNavToggle(e) {
    if (e.target.checked) {
      document.querySelector('.nav').classList.add('open');
      document.querySelector('.main').classList.add('nav-open');
      document.querySelector('.toggle i').classList.remove('fa-bars');
      document.querySelector('.toggle i').classList.add('fa-times');
    } else {
      document.querySelector('.nav').classList.remove('open');
      document.querySelector('.main').classList.remove('nav-open');
      document.querySelector('.toggle i').classList.remove('fa-times');
      document.querySelector('.toggle i').classList.add('fa-bars');
    }
  }

  closeNav() {
    document.getElementById('nav-toggle').checked = false;
    document.querySelector('.nav').classList.remove('open');
    document.querySelector('.main').classList.remove('nav-open');
    document.querySelector('.toggle i').classList.remove('fa-times');
    document.querySelector('.toggle i').classList.add('fa-bars');
  }

  render() {
    return (
      <header className="header">
        <div className="header--container">
          <div className="header--contents">
            <div className="header--title-container">
              <input
                id="nav-toggle"
                type="checkbox"
                onChange={this.onNavToggle}
              />
              <label className="toggle" htmlFor="nav-toggle">
                <i className="fa fa-bars"></i>
              </label>
              <NavLink
                className="header--title"
                to="/dashboard"
                onClick={this.closeNav}
              >
                광일MES
              </NavLink>
            </div>
            <div className="header--button-container">
              <span className="header--userLoggedIn">
                <b>{this.state.displayName}</b>님, 안녕하세요.
              </span>
              <a
                className="header--logout"
                onClick={() => {
                  Accounts.logout();
                }}
              >
                <i className="fa fa-sign-out"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="nav-container">
          <nav className="nav">
            <NavLink
              className="nav--item"
              activeClassName="nav--item--active"
              to="/dashboard"
              onClick={this.closeNav}
            >
              HOME
            </NavLink>
            <NavLink
              className="nav--item"
              activeClassName="nav--item--active"
              to="/accounts"
              onClick={this.closeNav}
            >
              거래처목록
            </NavLink>
            <NavLink
              className="nav--item"
              activeClassName="nav--item--active"
              to="/products"
              onClick={this.closeNav}
            >
              품목관리
            </NavLink>
            <NavLink
              className="nav--item"
              activeClassName="nav--item--active"
              to="/plates"
              onClick={this.closeNav}
            >
              동판관리
            </NavLink>
            <NavLink
              className="nav--item"
              activeClassName="nav--item--active"
              to="/orders"
              onClick={this.closeNav}
            >
              주문관리
            </NavLink>
            <NavLink
              className="nav--item"
              activeClassName="nav--item--active"
              to="/orders-completed"
              onClick={this.closeNav}
            >
              납품대기목록
            </NavLink>
            <NavLink
              className="nav--item"
              activeClassName="nav--item--active"
              to="/delivery"
              onClick={this.closeNav}
            >
              출고관리
            </NavLink>
            {this.state.isAdmin && (
              <NavLink
                className="nav--item"
                activeClassName="nav--item--active"
                to="/users"
                onClick={this.closeNav}
              >
                사용자관리
              </NavLink>
            )}
          </nav>
        </div>
      </header>
    );
  }
}
