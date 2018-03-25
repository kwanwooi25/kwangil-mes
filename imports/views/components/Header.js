import React from 'react';
import { NavLink } from 'react-router-dom';
import { Accounts } from 'meteor/accounts-base';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.onNavToggle = this.onNavToggle.bind(this);
    this.closeNav = this.closeNav.bind(this);
  }

  onNavToggle(e) {
    if (e.target.checked) {
      document.querySelector('.nav').classList.add('open');
    } else {
      document.querySelector('.nav').classList.remove('open');
    }
  }

  closeNav() {
    document.getElementById('nav-toggle').checked = false;
    document.querySelector('.nav').classList.remove('open');
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
                &#9776;
              </label>
              <NavLink
                className="header--title"
                to="/dashboard"
                onClick={this.closeNav}
              >
                광일MES
              </NavLink>
            </div>
            <a
              className="header--logout"
              onClick={() => {
                Accounts.logout();
              }}
            >
              Logout
            </a>
          </div>
        </div>
        <nav className="nav">
          <NavLink
            className="nav--item"
            activeClassName="nav--item--active"
            to="/dashboard"
            onClick={this.closeNav}
          >
            Dashboard
          </NavLink>
          <NavLink
            className="nav--item"
            activeClassName="nav--item--active"
            to="/accounts"
            onClick={this.closeNav}
          >
            업체관리
          </NavLink>
          <NavLink
            className="nav--item"
            activeClassName="nav--item--active"
            to="/products"
            onClick={this.closeNav}
          >
            품목관리
          </NavLink>
        </nav>
      </header>
    );
  }
}
