import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';

import FormElement from '../../custom/FormElement';
import ConfirmationModal from '../components/ConfirmationModal';

export default class AccountModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  selectedID   : account ID to display
  onModalClose : function to execute on modal close
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
        error: '',
        nameEmpty: false,
        phone_1Empty: false,
        phone_1Error: false,
        phone_2Error: false,
        faxError: false,
        email_1Error: false,
        email_2Error: false,
        regExp: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
        isConfirmationModalOpen: false,
        confirmationTitle: '',
        confirmationDescription: ''
      };
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
        error: '',
        nameEmpty: false,
        phone_1Empty: false,
        phone_1Error: false,
        phone_2Error: false,
        faxError: false,
        email_1Error: false,
        email_2Error: false,
        regExp: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
        isConfirmationModalOpen: false,
        confirmationTitle: '',
        confirmationDescription: ''
      };
    }

    this.state = initialState;

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onConfirmationModalClose = this.onConfirmationModalClose.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
  }

  onInputChange(e) {
    // add and remove class 'changed' on EDIT mode
    if (
      this.state.mode === 'EDIT' &&
      initialState[e.target.name] !== e.target.value
    ) {
      e.target.parentNode.classList.add('changed');
    } else {
      e.target.parentNode.classList.remove('changed');
    }

    // setState as input value changes
    if (
      e.target.name === 'phone_1' ||
      e.target.name === 'phone_2' ||
      e.target.name === 'fax'
    ) {
      this.setState({
        [e.target.name]: this.formatPhoneNumber(
          e.target.value.replace(/-/g, '')
        )
      });
    } else {
      this.setState({
        [e.target.name]: e.target.value
      });
    }

    // check validation
    this.validate(e.target.name, e.target.value);
  }

  validate(name, value) {
    const inputContainer = document.getElementById(name).parentNode;

    // validate name
    if (name === 'name') {
      if (value === '') {
        this.setState({ nameEmpty: true });
        inputContainer.classList.add('error');
        return false;
      } else {
        this.setState({ nameEmpty: false });
        inputContainer.classList.remove('error');
        return true;
      }
    }

    // validate phone_1
    if (name === 'phone_1') {
      if (value === '') {
        this.setState({ phone_1Empty: true, phone_1Error: false });
        inputContainer.classList.add('error');
        return false;
      } else if (isNaN(value.replace(/-/g, ''))) {
        this.setState({ phone_1Empty: false, phone_1Error: true });
        inputContainer.classList.add('error');
        return false;
      } else {
        this.setState({ phone_1Empty: false, phone_1Error: false });
        inputContainer.classList.remove('error');
        return true;
      }
    }

    // validate phone_2 & fax
    if (name === 'phone_2' || name === 'fax') {
      if (isNaN(value.replace(/-/g, ''))) {
        this.setState({ [`${name}Error`]: true });
        inputContainer.classList.add('error');
        return false;
      } else {
        this.setState({ [`${name}Error`]: false });
        inputContainer.classList.remove('error');
        return true;
      }
    }

    // validate email
    if (name === 'email_1' || name === 'email_2') {
      if (!value.match(this.state.regExp) && value !== '') {
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

  formatPhoneNumber(number) {
    const result = number.replace(
      /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/,
      '$1-$2-$3'
    );
    return result;
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
      if (this.state.mode === 'ADDNEW') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '거래처 신규 등록',
          confirmationDescription: '신규 등록 하시겠습니까?'
        });
      } else if (this.state.mode === 'EDIT') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '거래처 정보 수정',
          confirmationDescription: '수정하신 내용을 저장하시겠습니까?'
        });
      }
    }
  }

  onConfirmationModalClose(answer) {
    this.setState({ isConfirmationModalOpen: false });

    const data = {
      name: this.state.name,
      phone_1: this.state.phone_1,
      phone_2: this.state.phone_2,
      fax: this.state.fax,
      email_1: this.state.email_1,
      email_2: this.state.email_2,
      address: this.state.address,
      memo: this.state.memo
    };

    // ADDNEW mode
    if (this.state.mode === 'ADDNEW' && answer) {
      Meteor.call('accounts.insert', data, (err, res) => {
        if (!err) {
          this.props.onModalClose();
        } else {
          this.setState({ error: err.error });
        }
      });

      // EDIT mode
    } else if (this.state.mode === 'EDIT' && answer) {
      Meteor.call('accounts.update', this.state.accountID, data, (err, res) => {
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
          <h1>
            {this.state.mode === 'ADDNEW' ? '거래처 등록' : undefined}
            {this.state.mode === 'EDIT' ? '거래처 정보수정' : undefined}
          </h1>
        </div>
        <form className="boxed-view__content">
          <FormElement
            tagName="input"
            inputType="text"
            id="name"
            label="업체명"
            value={this.state.name}
            onInputChange={this.onInputChange}
            errorMessage={
              this.state.accountNameEmpty ? '업체명을 입력하세요.' : undefined
            }
          />
          <FormElement
            tagName="input"
            inputType="tel"
            id="phone_1"
            label="전화번호1"
            value={this.state.phone_1}
            onInputChange={this.onInputChange}
            errorMessage={
              this.state.phone_1Empty
                ? '전화번호를 입력하세요.'
                : this.state.phone_1Error
                  ? '숫자만 입력 가능합니다.'
                  : undefined
            }
          />
          <FormElement
            tagName="input"
            inputType="tel"
            id="phone_2"
            label="전화번호2"
            value={this.state.phone_2}
            onInputChange={this.onInputChange}
            errorMessage={this.state.phone_2Error
              ? '숫자만 입력 가능합니다.'
              : undefined
            }
          />
          <FormElement
            tagName="input"
            inputType="tel"
            id="fax"
            label="팩스번호"
            value={this.state.fax}
            onInputChange={this.onInputChange}
            errorMessage={this.state.faxError
              ? '숫자만 입력 가능합니다.'
              : undefined
            }
          />
          <FormElement
            tagName="input"
            inputType="email"
            id="email_1"
            label="이메일1"
            value={this.state.email_1}
            onInputChange={this.onInputChange}
            errorMessage={this.state.email_1Error
              ? '올바른 이메일 형식이 아닙니다.'
              : undefined
            }
          />
          <FormElement
            tagName="input"
            inputType="email"
            id="email_2"
            label="이메일2"
            value={this.state.email_2}
            onInputChange={this.onInputChange}
            errorMessage={this.state.email_2Error
              ? '올바른 이메일 형식이 아닙니다.'
              : undefined
            }
          />
          <FormElement
            tagName="input"
            inputType="text"
            id="address"
            label="주소"
            value={this.state.address}
            onInputChange={this.onInputChange}
          />
          <FormElement
            tagName="textarea"
            id="memo"
            label="메모"
            value={this.state.memo}
            onInputChange={this.onInputChange}
          />

          {this.state.error ? (
            <p className="account-modal__error">{this.state.error}</p>
          ) : (
            undefined
          )}

          <div className="account-modal__button-group">
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
        {this.state.isConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title={this.state.confirmationTitle}
            description={this.state.confirmationDescription}
            onModalClose={this.onConfirmationModalClose}
          />
        ) : (
          undefined
        )}
      </Modal>
    );
  }
}
