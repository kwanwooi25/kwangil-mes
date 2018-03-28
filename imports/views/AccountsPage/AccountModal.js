import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';

export default class AccountModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorAccountName: '',
      errorAccountPhone: '',
      errorAccountEmail_1: '',
      errorAccountEmail_2: '',
      isModalOpen: props.isOpen
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
  }

  onInputChange(e) {
    console.log(e.target);
    if (e.target.name === 'accountName') {
      if (e.target.value === '') {
        this.setState({ errorAccountName: '업체명을 입력하세요' });
        e.target.parentNode.classList.add('error');
      } else {
        this.setState({ errorAccountName: '' });
        e.target.parentNode.classList.remove('error');
      }
    }

    if (e.target.name === 'accountPhone_1') {
      if (e.target.value === '') {
        this.setState({ errorAccountPhone: '전화번호를 입력하세요.' });
        e.target.parentNode.classList.add('error');
      } else {
        this.setState({ errorAccountPhone: '' });
        e.target.parentNode.classList.remove('error');
      }
    }

    if (
      e.target.name === 'accountEmail_1' ||
      e.target.name === 'accountEmail_2'
    ) {
      const regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
      if (!e.target.value.match(regExp)) {
        if (e.target.name === 'accountEmail_1') {
          this.setState({
            errorAccountEmail_1: '올바른 이메일 형식이 아닙니다.'
          });
        } else if (e.target.name === 'accountEmail_2') {
          this.setState({
            errorAccountEmail_2: '올바른 이메일 형식이 아닙니다.'
          });
        }
        e.target.parentNode.classList.add('error');
      } else {
        if (e.target.name === 'accountEmail_1') {
          this.setState({ errorAccountEmail_1: '' });
        } else if (e.target.name === 'accountEmail_2') {
          this.setState({ errorAccountEmail_2: '' });
        }
        e.target.parentNode.classList.remove('error');
      }
    }
  }

  onClickOK(e) {
    e.preventDefault();
    const inputData = {
      name: this.refs.accountName.value.trim(),
      phone_1: this.refs.accountPhone_1.value.trim(),
      phone_2: this.refs.accountPhone_2.value.trim(),
      fax: this.refs.accountFax.value.trim(),
      email_1: this.refs.accountEmail_1.value.trim(),
      email_2: this.refs.accountEmail_2.value.trim(),
      address: this.refs.accountAddress.value.trim(),
      memo: this.refs.accountMemo.value.trim()
    };

    const regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

    if (inputData.name === '') {
      this.setState({ errorAccountName: '업체명을 입력하세요.' });
      this.refs.accountName.classList.add('error');
      this.refs.accountName.focus();
    } else if (inputData.phone_1 === '') {
      this.setState({ errorAccountPhone: '전화번호를 입력하세요.' });
      this.refs.accountPhone_1.classList.add('error');
      this.refs.accountPhone_1.focus();
    } else if (!inputData.email_1.match(regExp) && inputData.email_1 !== '') {
      this.setState({ errorAccountEmail_1: '올바른 이메일 형식이 아닙니다.'});
      this.refs.accountEmail_1.classList.add('error');
      this.refs.accountEmail_1.focus();
    } else if (!inputData.email_2.match(regExp) && inputData.email_2 !== '') {
      this.setState({ errorAccountEmail_2: '올바른 이메일 형식이 아닙니다.'});
      this.refs.accountEmail_2.classList.add('error');
      this.refs.accountEmail_2.focus();
    } else {
      Meteor.call('accounts.insert', inputData, (err, res) => {
        if (!err) {
          this.props.onModalClose();
        } else {
          this.setState({ error: err.error });
        }
      });
    }
  }

  onClickCancel(e) {
    e.preventDefault();
    this.props.onModalClose();
  }

  render() {
    return (
      <Modal
        isOpen={this.state.isModalOpen}
        onAfterOpen={() => {
          document.getElementById('accountName').focus();
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
            <label htmlFor="accountName">업체명</label>
            <div className="input-with-message">
              <input
                type="text"
                id="accountName"
                ref="accountName"
                name="accountName"
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
              />
              <span>
                {this.state.errorAccountName
                  ? this.state.errorAccountName
                  : undefined}
              </span>
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountPhone_1">전화번호1</label>
            <div className="input-with-message">
              <input
                type="tel"
                id="accountPhone_1"
                ref="accountPhone_1"
                name="accountPhone_1"
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
              />
              <span>
                {this.state.errorAccountPhone
                  ? this.state.errorAccountPhone
                  : undefined}
              </span>
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountPhone_2">전화번호2</label>
            <div className="input-with-message">
              <input
                type="tel"
                id="accountPhone_2"
                ref="accountPhone_2"
                name="accountPhone_2"
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
            <label htmlFor="accountEmail_1">이메일1</label>
            <div className="input-with-message">
              <input
                type="email"
                id="accountEmail_1"
                ref="accountEmail_1"
                name="accountEmail_1"
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
              />
              <span>
                {this.state.errorAccountEmail_1
                  ? this.state.errorAccountEmail_1
                  : undefined}
              </span>
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountEmail_2">이메일2</label>
            <div className="input-with-message">
              <input
                type="email"
                id="accountEmail_2"
                ref="accountEmail_2"
                name="accountEmail_2"
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
              />
              <span>
                {this.state.errorAccountEmail_2
                  ? this.state.errorAccountEmail_2
                  : undefined}
              </span>
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountAddress">주소</label>
            <div className="input-with-message">
              <input
                type="text"
                id="accountAddress"
                ref="accountAddress"
                name="accountAddress"
              />
            </div>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountMemo">메모</label>
            <div className="input-with-message">
              <textarea id="accountMemo" ref="accountMemo" />
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
