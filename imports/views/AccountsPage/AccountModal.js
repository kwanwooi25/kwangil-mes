import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';

export default class AccountModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen              : if modal is open
  selectedID          : account ID to display
  onAccountModalClose : function to execute on modal close
  ==========================================================================*/
  constructor(props) {
    super(props);

    if (props.selectedID) {
      // EDIT mode
      const account = AccountsData.findOne({ _id: props.selectedID });
      initialState = {
        mode: 'EDIT',
        accountID: props.selectedID,
        name: account.name,
        phone_1: account.phone_1,
        phone_2: account.phone_2,
        fax: account.fax,
        email_1: account.email_1,
        email_2: account.email_2,
        address: account.address,
        memo: account.memo,
        nameError: false,
        phone_1Error: false,
        email_1Error: false,
        email_2Error: false,
        regExp: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
      }
    } else {
      // ADDNEW mode
      initialState = {
        mode: 'ADDNEW',
        accountID: '',
        name: '',
        phone_1: '',
        phone_2: '',
        fax: '',
        email_1: '',
        email_2: '',
        address: '',
        memo: '',
        nameError: false,
        phone_1Error: false,
        email_1Error: false,
        email_2Error: false,
        regExp: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
      }
    }

    this.state = initialState;

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
  }

  onInputChange(e) {
    console.log(e.target);

    // add and remove class 'changed' on EDIT mode
    if (this.state.mode === 'EDIT' && initialState[e.target.name] !== e.target.value) {
      e.target.parentNode.classList.add('changed');
    } else {
      e.target.parentNode.classList.remove('changed');
    }

    // setState as input value changes
    this.setState({
      [e.target.name]: e.target.value
    });

    // check validation
    this.validate(e.target.name, e.target.value);
  }

  validate(name, value) {
    const errorState = name + 'Error';
    const inputContainer = document.getElementById(name).parentNode;

    // validate name and phone_1
    if (name === 'name' || name === 'phone_1') {
      if (value === '') {
        this.setState({ [errorState]: true });
        inputContainer.classList.add('error');
        return false;
      } else {
        this.setState({ [errorState]: false });
        inputContainer.classList.remove('error');
        return true;
      }
    }

    // validate email
    if (name === 'email_1' || name === 'email_2') {
      if (!value.match(this.state.regExp) && value !== '') {
        this.setState({ [errorState]: true });
        inputContainer.classList.add('error');
        return false;
      } else {
        this.setState({ [errorState]: false });
        inputContainer.classList.remove('error');
        return true;
      }
    }
  }

  onClickOK(e) {
    e.preventDefault();

    // validation
    if (!this.validate('name', this.state.name)) {
      this.refs.name.focus();
    } else if (!this.validate('phone_1', this.state.phone_1)) {
      this.refs.phone_1.focus();
    } else if (!this.validate('email_1', this.state.email_1)) {
      this.refs.email_1.focus();
    } else if (!this.validate('email_2', this.state.email_2)) {
      this.refs.email_2.focus();
    } else {

      const data = {
        name: this.state.name,
        phone_1: this.state.phone_1,
        phone_2: this.state.phone_2,
        fax: this.state.fax,
        email_1: this.state.email_1,
        email_2: this.state.email_2,
        address: this.state.address,
        memo: this.state.memo
      }

      if (this.state.mode === 'ADDNEW') {
        Meteor.call('accounts.insert', data, (err, res) => {
          if (!err) {
            this.props.onModalClose();
          } else {
            this.setState({ error: err.error });
          }
        });
      }
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
          document.getElementById('name').focus();
        }}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box account-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>업체등록</h1>
        </div>
        <form className="boxed-view__content">
          <div className="react-modal__input-container">
            <label htmlFor="name">업체명</label>
            <div className="input-with-message">
              <input
                type="text"
                id="name"
                ref="name"
                name="name"
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
              />
              <span>
                {this.state.nameError
                  ? '업체명을 입력하세요.'
                  : undefined}
              </span>
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="phone_1">전화번호1</label>
            <div className="input-with-message">
              <input
                type="tel"
                id="phone_1"
                ref="phone_1"
                name="phone_1"
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
              />
              <span>
                {this.state.phone_1Error
                  ? '전화번호를 입력하세요.'
                  : undefined}
              </span>
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="phone_2">전화번호2</label>
            <div className="input-with-message">
              <input
                type="tel"
                id="phone_2"
                ref="phone_2"
                name="phone_2"
              />
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountFax">팩스번호</label>
            <div className="input-with-message">
              <input
                type="tel"
                id="accountFax"
                ref="accountFax"
                name="accountFax"
              />
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="email_1">이메일1</label>
            <div className="input-with-message">
              <input
                type="email"
                id="email_1"
                ref="email_1"
                name="email_1"
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
              />
              <span>
                {this.state.email_1Error
                  ? '올바른 이메일 형식이 아닙니다.'
                  : undefined}
              </span>
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="email_2">이메일2</label>
            <div className="input-with-message">
              <input
                type="email"
                id="email_2"
                ref="email_2"
                name="email_2"
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
              />
              <span>
                {this.state.email_2Error
                  ? '올바른 이메일 형식이 아닙니다.'
                  : undefined}
              </span>
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="address">주소</label>
            <div className="input-with-message">
              <input
                type="text"
                id="address"
                ref="address"
                name="address"
              />
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="memo">메모</label>
            <div className="input-with-message">
              <textarea id="memo" ref="memo" />
            </div>
          </div>
          <div className="account-modal__button-group">
            <button className="button" onClick={this.onClickOK}>
              업체등록
            </button>
            <button
              className="button button-cancel"
              onClick={this.onClickCancel}
            >
              취소
            </button>
          </div>
        </form>
      </Modal>
    );
  }
}
