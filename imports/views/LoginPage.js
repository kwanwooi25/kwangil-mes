import React from 'react';
import { Meteor } from 'meteor/meteor';

export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: ''
    };

    this.onLoginClick = this.onLoginClick.bind(this);
  }

  onLoginClick(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    Meteor.loginWithPassword({ username }, password, err => {
      if (err) {
        this.setState({ error: '아이디와 비밀번호를 확인하세요' });
      } else {
        this.setState({ error: '' });
      }
    });
  }

  render() {
    return (
      <div className="boxed-view__bg">
        <div className="boxed-view__box">
          <div className="boxed-view__header">
            <h1>로그인</h1>
          </div>
          <form className="boxed-view__content">
            <label htmlFor="username">아이디</label>
            <input
              className="boxed-view__content__input"
              type="text"
              id="username"
              name="username"
            />
            <label htmlFor="password">비밀번호</label>
            <input
              className="boxed-view__content__input"
              type="password"
              id="password"
              name="password"
            />
            {this.state.error ? (
              <p className="boxed-view__content__error">
                {this.state.error}
              </p>
            ) : (
              undefined
            )}
            <button
              className="boxed-view__content__button"
              onClick={this.onLoginClick}
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }
}
