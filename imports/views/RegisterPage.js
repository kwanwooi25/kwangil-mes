import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export default class RegisterPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      errorUsername: '',
      errorPassword: '',
      errorPasswordConf: '',
      errorDisplayName: '',
      errorDepartment: '',
      errorPosition: ''
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onRegisterClick = this.onRegisterClick.bind(this);
  }

  onInputChange(e) {
    if (e.target.name === 'username') {
      if (e.target.value === '') {
        this.setState({ errorUsername: '아이디를 입력하세요' });
        e.target.classList.add('error');
      } else {
        this.setState({ errorUsername: '' });
        e.target.classList.remove('error');
      }
    }

    if (e.target.name === 'password') {
      if (e.target.value === '') {
        this.setState({ errorPassword: '비밀번호를 입력하세요' });
        e.target.classList.add('error');
      } else {
        this.setState({ errorPassword: '' });
        e.target.classList.remove('error');
      }
    }

    if (e.target.name === 'passwordConf') {
      if (
        document.getElementById('password').value.trim() !==
        e.target.value.trim()
      ) {
        this.setState({ errorPasswordConf: '비밀번호가 일치하지 않습니다' });
        e.target.classList.add('error');
      } else {
        this.setState({ errorPasswordConf: '' });
        e.target.classList.remove('error');
      }
    }

    if (e.target.name === 'displayName') {
      if (e.target.value === '') {
        this.setState({ errorDisplayName: '이름을 입력하세요' });
        e.target.classList.add('error');
      } else {
        this.setState({ errorDisplayName: '' });
        e.target.classList.remove('error');
      }
    }

    if (e.target.name === 'department') {
      if (e.target.value === '') {
        this.setState({ errorDepartment: '부서를 입력하세요' });
        e.target.classList.add('error');
      } else {
        this.setState({ errorDepartment: '' });
        e.target.classList.remove('error');
      }
    }

    if (e.target.name === 'position') {
      if (e.target.value === '') {
        this.setState({ errorPosition: '직책을 입력하세요' });
        e.target.classList.add('error');
      } else {
        this.setState({ errorPosition: '' });
        e.target.classList.remove('error');
      }
    }
  }

  onRegisterClick(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const passwordConf = document.getElementById('passwordConf').value.trim();
    const userRole = document.getElementById('userRole').value.trim();
    const profile = {
      displayName: document.getElementById('displayName').value.trim(),
      department: document.getElementById('department').value.trim(),
      position: document.getElementById('position').value.trim(),
      isManager: userRole === 'manager',
      isAdmin: userRole === 'admin'
    };

    if (username === '') {
      this.setState({ errorUsername: '아이디를 입력하세요' });
      document.getElementById('username').classList.add('error');
    }

    if (password === '') {
      this.setState({ errorPassword: '비밀번호를 입력하세요' });
      document.getElementById('password').classList.add('error');
    }

    if (password !== passwordConf) {
      this.setState({ errorPasswordConf: '비밀번호가 일치하지 않습니다' });
      document.getElementById('passwordConf').classList.add('error');
    }

    if (profile.displayName === '') {
      this.setState({ errorDisplayName: '이름을 입력하세요' });
      document.getElementById('displayName').classList.add('error');
    }

    if (profile.department === '') {
      this.setState({ errorDepartment: '부서를 입력하세요' });
      document.getElementById('department').classList.add('error');
    }

    if (profile.position === '') {
      this.setState({ errorPosition: '직책을 입력하세요' });
      document.getElementById('position').classList.add('error');
    }

    if (
      username !== '' &&
      password !== '' &&
      password === passwordConf &&
      profile.displayName !== '' &&
      profile.department !== '' &&
      profile.position !== ''
    ) {
      Accounts.createUser({ username, password, profile }, err => {
        if (err) {
          console.log(err);
        }
      });
    }
  }

  render() {
    return (
      <div className="boxed-view__bg">
        <div className="boxed-view__box">
          <div className="boxed-view__header">
            <h1>사용자 등록</h1>
          </div>
          <form className="boxed-view__content">
            <label htmlFor="username">아이디</label>
            <input
              className="boxed-view__content__input"
              type="text"
              id="username"
              name="username"
              onChange={this.onInputChange}
            />
            <span className="boxed-view__content__error">
              {this.state.errorUsername ? this.state.errorUsername : undefined}
            </span>
            <label htmlFor="password">비밀번호</label>
            <input
              className="boxed-view__content__input"
              type="password"
              id="password"
              name="password"
              onChange={this.onInputChange}
            />
            <span className="boxed-view__content__error">
              {this.state.errorPassword ? this.state.errorPassword : undefined}
            </span>
            <label htmlFor="passwordConf">비밀번호 확인</label>
            <input
              className="boxed-view__content__input"
              type="password"
              id="passwordConf"
              name="passwordConf"
              onChange={this.onInputChange}
            />
            <span className="boxed-view__content__error">
              {this.state.errorPasswordConf
                ? this.state.errorPasswordConf
                : undefined}
            </span>
            <label htmlFor="displayName">이름</label>
            <input
              className="boxed-view__content__input"
              type="text"
              id="displayName"
              name="displayName"
              onChange={this.onInputChange}
            />
            <span className="boxed-view__content__error">
              {this.state.errorDisplayName
                ? this.state.errorDisplayName
                : undefined}
            </span>
            <label htmlFor="department">부서</label>
            <input
              className="boxed-view__content__input"
              type="text"
              id="department"
              name="department"
              onChange={this.onInputChange}
            />
            <span className="boxed-view__content__error">
              {this.state.errorDepartment
                ? this.state.errorDepartment
                : undefined}
            </span>
            <label htmlFor="position">직책</label>
            <input
              className="boxed-view__content__input"
              type="text"
              id="position"
              name="position"
              onChange={this.onInputChange}
            />
            <span className="boxed-view__content__error">
              {this.state.errorPosition ? this.state.errorPosition : undefined}
            </span>
            <label htmlFor="userRole">권한</label>
            <select
              className="boxed-view__content__select"
              id="userRole"
              name="userRole"
              onChange={this.onInputChange}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <button
              className="boxed-view__content__button"
              onClick={this.onRegisterClick}
            >
              사용자 등록
            </button>
          </form>
        </div>
      </div>
    );
  }
}
