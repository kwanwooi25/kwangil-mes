import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import TextInput from '../../custom/TextInput';
import Textarea from '../../custom/Textarea';
import ConfirmationModal from '../components/ConfirmationModal';

export default class UserModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  userID       : user ID to display
  onModalClose : function to execute on modal close
  editFor
  ==========================================================================*/
  constructor(props) {
    super(props);

    if (props.userID) {
      const user = Meteor.users.findOne({ _id: props.userID });
      // EDIT mode
      initialState = {
        mode:
          props.editFor === 'profile'
            ? 'EDIT_PROFILE'
            : props.editFor === 'password' && 'RESET_PASSWORD',
        userID: props.userID,
        username: user.username,
        password: '',
        passwordConf: '',
        displayName: user.profile.displayName,
        department: user.profile.department,
        position: user.profile.position,
        role:
          user.profile.isManager
          ? 'manager'
          : user.profile.isAdmin ? 'admin' : 'user',
        isConfirmationModalOpen: false,
        confirmationTitle: '',
        confirmationDescription: [],
        usernameEmpty: false,
        passwordEmpty: false,
        passwordConfError: false,
        displayNameEmpty: false
      };
    } else {
      // ADDNEW mode
      initialState = {
        mode: 'ADDNEW',
        userID: '',
        username: '',
        password: '',
        passwordConf: '',
        displayName: '',
        department: '',
        position: '',
        role: 'user',
        isConfirmationModalOpen: false,
        confirmationTitle: '',
        confirmationDescription: [],
        usernameEmpty: false,
        passwordEmpty: false,
        passwordConfError: false,
        displayNameEmpty: false
      };
    }

    this.state = initialState;

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onConfirmationModalClose = this.onConfirmationModalClose.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
  }

  onInputChange(e) {
    if (this.state.mode === 'EDIT_PROFILE') {
      // add and remove class 'changed' on EDIT mode
      if (initialState[e.target.name] !== e.target.value) {
        e.target.parentNode.classList.add('changed');
      } else {
        e.target.parentNode.classList.remove('changed');
      }
    }

    this.setState({ error: '' });

    this.setState({ [e.target.name]: e.target.value });
    this.validate(e.target.name, e.target.value);
  }

  validate(name, value) {
    const inputContainer = document.getElementById(name).parentNode;

    switch (name) {
      case 'username':
      case 'password':
      case 'displayName':
        if (value === '') {
          this.setState({ [`${name}Empty`]: true });
          inputContainer.classList.add('error');
          return false;
        } else {
          this.setState({ [`${name}Empty`]: false });
          inputContainer.classList.remove('error');
          return true;
        }
        break;

      case 'passwordConf':
        if (value !== this.state.password) {
          this.setState({ [`${name}Error`]: true });
          inputContainer.classList.add('error');
          return false;
        } else {
          this.setState({ [`${name}Error`]: false });
          inputContainer.classList.remove('error');
          return true;
        }
    }
  }

  // formatPhoneNumber(number) {
  //   const result = number.replace(
  //     /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/,
  //     '$1-$2-$3'
  //   );
  //   return result;
  // }

  onClickOK(e) {
    e.preventDefault();

    // validation
    if (!this.validate('username', this.state.username)) {
      document.getElementById('username').focus();
    } else if (
      this.refs.password &&
      !this.validate('password', this.state.password)
    ) {
      document.getElementById('password').focus();
    } else if (
      this.refs.passwordConf &&
      !this.validate('passwordConf', this.state.passwordConf)
    ) {
      document.getElementById('passwordConf').focus();
    } else if (
      this.refs.displayName &&
      !this.validate('displayName', this.state.displayName)
    ) {
      document.getElementById('displayName').focus();
    } else {
      if (this.state.mode === 'ADDNEW') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '사용자 신규 등록',
          confirmationDescription: [
            '아래 사용자를 신규 등록 하시겠습니까?',
            `${this.state.displayName} (${this.state.username})`
          ]
        });
      } else if (this.state.mode === 'EDIT_PROFILE') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '사용자 정보 수정',
          confirmationDescription: ['수정하신 내용을 저장하시겠습니까?']
        });
      } else if (this.state.mode === 'RESET_PASSWORD') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '비밀번호 변경',
          confirmationDescription: ['변경된 비밀번호를 저장하시겠습니까?']
        });
      }
    }
  }

  onConfirmationModalClose(answer) {
    this.setState({ isConfirmationModalOpen: false });

    const username = this.state.username;
    const password = this.state.password;
    const profile = {
      displayName: this.state.displayName,
      department: this.state.department,
      position: this.state.position,
      isManager: this.state.role === 'manager'
    };

    // ADDNEW mode
    if (this.state.mode === 'ADDNEW' && answer) {
      Accounts.createUser({ username, password, profile }, err => {
        if (!err || err.reason === 'Login forbidden') {
          this.props.onModalClose();
        } else {
          this.setState({ error: err.message });
        }
      });

      // EDIT_PROFILE mode
    } else if (this.state.mode === 'EDIT_PROFILE' && answer) {
      Meteor.users.update(this.state.userID, { $set: { profile } });
      this.props.onModalClose();

      // RESET_PASSWORD mode
    } else if (this.state.mode === 'RESET_PASSWORD' && answer) {
      Meteor.call(
        'users.setPassword',
        this.state.userID,
        password,
        (err, res) => {
          if (!err) this.props.onModalClose();
        }
      );
    }
  }

  onClickCancel(e) {
    e.preventDefault();
    this.props.onModalClose();
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onAfterOpen={() => {
          document.getElementById('username').focus();
        }}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box user-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>
            {this.state.mode === 'ADDNEW' && '사용자 등록'}
            {this.state.mode === 'EDIT_PROFILE' && '사용자 정보수정'}
            {this.state.mode === 'RESET_PASSWORD' && '비밀번호 변경'}
          </h1>
        </div>
        <form className="boxed-view__content">
          <div className="form-element-container">
            <div className="form-element__label">
              <label htmlFor="username">아이디</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element"
                inputType="text"
                id="username"
                value={this.state.username}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.usernameEmpty && '아이디를 입력하세요.'
                }
                disabled={this.state.mode !== 'ADDNEW'}
              />
            </div>
          </div>

          {this.state.mode !== 'EDIT_PROFILE' && (
            <div className="form-element-container">
              <div className="form-element__label">
                <label htmlFor="password">비밀번호</label>
              </div>
              <div className="form-elements">
                <TextInput
                  className="form-element"
                  inputType="password"
                  id="password"
                  ref="password"
                  value={this.state.password}
                  onInputChange={this.onInputChange}
                  errorMessage={
                    this.state.passwordEmpty && '비밀번호를 입력하세요.'
                  }
                />
              </div>
            </div>
          )}

          {this.state.mode !== 'EDIT_PROFILE' && (
            <div className="form-element-container">
              <div className="form-element__label">
                <label htmlFor="passwordConf">비밀번호 확인</label>
              </div>
              <div className="form-elements">
                <TextInput
                  className="form-element"
                  inputType="password"
                  id="passwordConf"
                  ref="passwordConf"
                  value={this.state.passwordConf}
                  onInputChange={this.onInputChange}
                  errorMessage={
                    this.state.passwordConfError &&
                    '비밀번호가 일치하지 않습니다.'
                  }
                />
              </div>
            </div>
          )}

          {this.state.mode !== 'RESET_PASSWORD' && (
            <div className="form-element-container">
              <div className="form-element__label">
                <label htmlFor="displayName">이름</label>
              </div>
              <div className="form-elements">
                <TextInput
                  className="form-element"
                  inputType="text"
                  id="displayName"
                  ref="displayName"
                  value={this.state.displayName}
                  onInputChange={this.onInputChange}
                  errorMessage={
                    this.state.displayNameEmpty && '이름을 입력하세요.'
                  }
                />
              </div>
            </div>
          )}

          {this.state.mode !== 'RESET_PASSWORD' && (
            <div className="form-element-container">
              <div className="form-element__label">
                <label htmlFor="department">부서</label>
              </div>
              <div className="form-elements">
                <TextInput
                  className="form-element"
                  inputType="text"
                  id="department"
                  value={this.state.department}
                  onInputChange={this.onInputChange}
                />
              </div>
            </div>
          )}

          {this.state.mode !== 'RESET_PASSWORD' && (
            <div className="form-element-container">
              <div className="form-element__label">
                <label htmlFor="position">직책</label>
              </div>
              <div className="form-elements">
                <TextInput
                  className="form-element"
                  inputType="text"
                  id="position"
                  value={this.state.position}
                  onInputChange={this.onInputChange}
                />
              </div>
            </div>
          )}

          {this.state.mode !== 'RESET_PASSWORD' && (
            <div className="form-element-container">
              <div className="form-element__label">
                <label htmlFor="role">권한</label>
              </div>
              <div className="form-elements">
                <select
                  className="select user-modal__role-select"
                  id="role"
                  name="role"
                  value={this.state.role}
                  onChange={this.onInputChange}
                  disabled={this.state.role === 'admin'}
                >
                  <option value="user">사용자</option>
                  <option value="manager">관리자</option>
                  <option value="admin" disabled>최종관리자</option>
                </select>
              </div>
            </div>
          )}

          {this.state.error && (
            <p className="user-modal__error">{this.state.error}</p>
          )}

          <div className="button-group">
            <button className="button" onClick={this.onClickOK}>
              저장
            </button>
            <button
              className="button button-cancel"
              onClick={this.onClickCancel}
            >
              취소
            </button>
          </div>
        </form>

        {this.state.isConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title={this.state.confirmationTitle}
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.onConfirmationModalClose}
          />
        )}
      </Modal>
    );
  }
}
