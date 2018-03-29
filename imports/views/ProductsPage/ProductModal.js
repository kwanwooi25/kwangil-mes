import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';

import ConfirmationModal from '../components/ConfirmationModal';

export default class ProductModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  selectedID   : product ID to display
  onModalClose : function to execute on modal close
  ==========================================================================*/
  constructor(props) {
    super(props);

    if (props.selectedID) {
      // EDIT mode
      const product = ProductsData.findOne({ _id: props.selectedID });
      initialState = {};
    } else {
      // ADDNEW mode
      initialState = {
        mode: 'ADDNEW',
        productID: '',
        accountList: [],
        accountID: '',
        accountName: '',
        name: '',
        thick: '',
        length: '',
        width: '',
        accountNameEmpty: false,
        accountNameError: false,
        nameEmpty: false,
        thickEmpty: false,
        lengthEmpty: false,
        widthEmpty: false,
        thickError: false,
        lengthError: false,
        widthError: false,
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

  componentDidMount() {
    // get account list
    this.databaseTracker = Tracker.autorun(() => {
      Meteor.subscribe('accounts');
      const accountList = AccountsData.find({}, { fields: { _id: 1, name: 1 } })
        .fetch()
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
      this.setState({ accountList });
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
  }

  // generate datalist for accountName input
  getAccountNameList() {
    return this.state.accountList.map(account => {
      return <option value={account.name} key={account._id} id={account._id} />;
    });
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
    this.setState({ [e.target.name]: e.target.value });

    // check validation
    this.validate(e.target.name, e.target.value);
  }

  validate(name, value) {
    const inputContainer = document.getElementById(name).parentNode;

    // validate accountName
    if (name === 'accountName') {
      const selectedAccount = this.state.accountList.find(
        account => account.name === value
      );

      // check if accountName is empty
      if (value === '') {
        this.setState({
          accountNameEmpty: true,
          accountNameError: false,
          accountID: ''
        });
        inputContainer.classList.add('error');
        return false;

        // check if accountName exist
      } else if (!selectedAccount) {
        this.setState({
          accountNameEmpty: false,
          accountNameError: true,
          accountID: ''
        });
        inputContainer.classList.add('error');
        return false;
      } else {
        this.setState({
          accountNameEmpty: false,
          accountNameError: false,
          accountID: selectedAccount._id
        });
        inputContainer.classList.remove('error');
        return true;
      }
    }

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

    // validate size
    if (name === 'thick' || name === 'length' || name === 'width') {
      if (value === '') {
        this.setState({ [`${name}Empty`]: true, [`${name}Error`]: false });
        inputContainer.classList.add('error');
        return false;
      } else if (isNaN(value)) {
        this.setState({ [`${name}Empty`]: false, [`${name}Error`]: true });
        inputContainer.classList.add('error');
        return false;
      } else {
        this.setState({ [`${name}Empty`]: false, [`${name}Error`]: false });
        inputContainer.classList.remove('error');
        return true;
      }
    }
  }

  onClickOK(e) {
    e.preventDefault();

    // validation
    if (!this.validate('accountName', this.state.accountName)) {
      this.refs.accountName.focus();
    } else if (!this.validate('name', this.state.name)) {
      this.refs.name.focus();
    } else if (!this.validate('thick', this.state.thick)) {
      this.refs.thick.focus();
    } else if (!this.validate('length', this.state.length)) {
      this.refs.length.focus();
    } else if (!this.validate('width', this.state.width)) {
      this.refs.width.focus();
    } else {
      if (this.state.mode === 'ADDNEW') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '제품 신규 등록',
          confirmationDescription: '신규 등록 하시겠습니까?'
        });
      } else if (this.state.mode === 'EDIT') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '제품 정보 수정',
          confirmationDescription: '수정하신 내용을 저장하시겠습니까?'
        });
      }
    }
  }

  onConfirmationModalClose(answer) {
    this.setState({ isConfirmationModalOpen: false });

    const data = {
      accountID: this.state.accountID,
      name: this.state.name,
      thick: this.state.thick,
      length: this.state.length,
      width: this.state.width
    };

    // ADDNEW mode
    if (this.state.mode === 'ADDNEW' && answer) {
      console.log('ADDNEW: ', data);
      this.props.onModalClose();
      // Meteor.call('products.insert', data, (err, res) => {
      //   if (!err) {
      //     this.props.onModalClose();
      //   } else {
      //     this.setState({ error: err.error });
      //   }
      // });

      //   // EDIT mode
      // } else if (this.state.mode === 'EDIT' && answer) {
      //   Meteor.call('products.update', this.state.productID, data, (err, res) => {
      //     if (!err) {
      //       this.props.onModalClose();
      //     } else {
      //       this.setState({ error: err.error });
      //     }
      //   });
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
          document.getElementById('accountName').focus();
        }}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box product-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>
            {this.state.mode === 'ADDNEW' ? '제품 등록' : undefined}
            {this.state.mode === 'EDIT' ? '제품 정보수정' : undefined}
          </h1>
        </div>
        <form className="boxed-view__content">
          <div className="react-modal__input-container">
            <div className="label-container">
              <label htmlFor="accountName">업체명</label>
            </div>
            <div className="input-with-message">
              <input
                type="text"
                id="accountName"
                ref="accountName"
                name="accountName"
                value={this.state.accountName}
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
                list="accountNameList"
              />
              <datalist id="accountNameList">
                {this.getAccountNameList()}
              </datalist>
              <span>
                {this.state.accountNameEmpty
                  ? '업체명을 입력하세요.'
                  : undefined}
                {this.state.accountNameError
                  ? '존재하지 않는 업체입니다.'
                  : undefined}
              </span>
            </div>
          </div>
          <div className="react-modal__input-container">
            <div className="label-container">
              <label htmlFor="name">제품명</label>
            </div>
            <div className="input-with-message">
              <input
                type="text"
                id="name"
                ref="name"
                name="name"
                value={this.state.name}
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
              />
              <span>
                {this.state.nameEmpty ? '제품명을 입력하세요.' : undefined}
              </span>
            </div>
          </div>
          <div className="react-modal__input-container">
            <div className="label-container">
              <label htmlFor="size">규격</label>
            </div>
            <div className="input-product-size">
              <div className="input-with-message">
                <input
                  type="text"
                  id="thick"
                  ref="thick"
                  name="thick"
                  value={this.state.thick}
                  onChange={this.onInputChange}
                  onBlur={this.onInputChange}
                />
                <span>
                  {this.state.thickEmpty ? '두께를 입력하세요.' : undefined}
                  {this.state.thickError ? '숫자만 입력 가능합니다.' : undefined}
                </span>
              </div>
              <i className="fa fa-times" style={{padding: '0.25rem'}}></i>
              <div className="input-with-message">
                <input
                  type="text"
                  id="length"
                  ref="length"
                  name="length"
                  value={this.state.length}
                  onChange={this.onInputChange}
                  onBlur={this.onInputChange}
                />
                <span>
                  {this.state.lengthEmpty ? '길이(원단)를 입력하세요.' : undefined}
                  {this.state.lengthError ? '숫자만 입력 가능합니다.' : undefined}
                </span>
              </div>
              <i className="fa fa-times" style={{padding: '0.25rem'}}></i>
              <div className="input-with-message">
                <input
                  type="text"
                  id="width"
                  ref="width"
                  name="width"
                  value={this.state.width}
                  onChange={this.onInputChange}
                  onBlur={this.onInputChange}
                />
                <span>
                  {this.state.widthEmpty ? '너비(가공)를 입력하세요.' : undefined}
                  {this.state.widthError ? '숫자만 입력 가능합니다.' : undefined}
                </span>
              </div>
            </div>
          </div>
          <div className="react-modal__input-container">
            <div className="label-container">
              <label>무지/인쇄</label>
            </div>
            <label className="radio-container">무지
              <input type="radio" name="isPrint"/>
              <span className="radiomark"></span>
            </label>
            <label className="radio-container">인쇄
              <input type="radio" name="isPrint"/>
              <span className="radiomark"></span>
            </label>
          </div>
          <div className="react-modal__input-container">
            <label htmlFor="memo">메모</label>
            <div className="input-with-message">
              <textarea
                id="memo"
                ref="memo"
                name="memo"
                value={this.state.memo}
                onChange={this.onInputChange}
                onBlur={this.onInputChange}
              />
            </div>
          </div>
          {this.state.error ? (
            <p className="product-modal__error">{this.state.error}</p>
          ) : (
            undefined
          )}
          <div className="product-modal__button-group">
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
