import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';

export default class AccountModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      isModalOpen: props.isOpen
    };

    this.onClickOK = this.onClickOK.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
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
    Meteor.call('accounts.insert', inputData, (err, res) => {
      if (!err) {
        this.props.onModalClose();
      } else {
        this.setState({ error: err.error });
      }
    });
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
            <input
              type="text"
              id="accountName"
              ref="accountName"
              name="accountName"
            />
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountPhone_1">전화번호1</label>
            <input
              type="tel"
              id="accountPhone_1"
              ref="accountPhone_1"
              name="accountPhone_1"
            />
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountPhone_2">전화번호2</label>
            <input
              type="tel"
              id="accountPhone_2"
              ref="accountPhone_2"
              name="accountPhone_2"
            />
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountFax">팩스번호</label>
            <input
              type="tel"
              id="accountFax"
              ref="accountFax"
              name="accountFax"
            />
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountEmail_1">이메일1</label>
            <input
              type="email"
              id="accountEmail_1"
              ref="accountEmail_1"
              name="accountEmail_1"
            />
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountEmail_2">이메일2</label>
            <input
              type="email"
              id="accountEmail_2"
              ref="accountEmail_2"
              name="accountEmail_2"
            />
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountAddress">주소</label>
            <input
              type="text"
              id="accountAddress"
              ref="accountAddress"
              name="accountAddress"
            />
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="accountMemo">메모</label>
            <textarea id="accountMemo" ref="accountMemo" />
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
