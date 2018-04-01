import { Meteor } from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';

import FormElement from '../../custom/FormElement';
import RadioButton from '../../custom/RadioButton';
import Checkbox from '../../custom/Checkbox';
import Textarea from '../../custom/Textarea';
import Accordion from '../../custom/Accordion';
import ConfirmationModal from '../components/ConfirmationModal';

export default class ProductModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  selectedID   : product ID to display
  onModalClose : function to execute on modal close
  isAdmin
  isManager
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
        isPrint: false,
        extColor: '',
        extAntistatic: false,
        extPretreat: '',
        extMemo: '',
        printImageFile: '',
        printFrontColorCount: '',
        printFrontColor: '',
        printFrontPosition: '',
        printBackColorCount: '',
        printBackColor: '',
        printBackPosition: '',
        printMemo: '',
        cutPosition: '',
        cutUltrasonic: false,
        cutPowderPack: false,
        cutPunches: false,
        cutPunchCount: '',
        cutPunchSize: '',
        cutPunchPosition: '',
        packMaterial: '',
        packQuantity: '',
        packDeliverAll: false,
        packMemo: '',
        stockQuantity: '',
        price: '',
        history: '',
        memo: '',
        accountNameEmpty: false,
        accountNameError: false,
        nameEmpty: false,
        thickEmpty: false,
        lengthEmpty: false,
        widthEmpty: false,
        thickError: false,
        lengthError: false,
        widthError: false,
        extColorEmpty: false,
        printFrontColorCountError: false,
        printBackColorCountError: false,
        cutPunchCountError: false,
        stockQuantityError: false,
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
    if (e.target.name === 'isPrint') {
      const value = e.target.value === 'isPrintTrue' ? true : false;
      this.setState({ [e.target.name]: value });
      if (!value) {
        this.setState({
          extPretreat: '',
          printImageFile: '',
          printFrontColorCount: '',
          printFrontColor: '',
          printFrontPosition: '',
          printBackColorCount: '',
          printBackColor: '',
          printBackPosition: '',
          printMemo: ''
        });
      }
      console.log(e.target.name, '=', value, '(', e.target.value, ')');
    } else if (e.target.type === 'checkbox') {
      this.setState({ [e.target.name]: e.target.checked });
      console.log(e.target.name, '=', e.target.checked);

      // reset punch details if cutPunches unchecked
      if (e.target.name === 'cutPunches') {
        if (!e.target.checked) {
          this.setState({
            cutPunchCount: '',
            cutPunchSize: '',
            cutPunchPosition: ''
          });
        }
      }
    } else {
      this.setState({ [e.target.name]: e.target.value });
      console.log(e.target.name, '=', e.target.value);
    }

    // check validation
    if (e.target.type !== 'checkbox' && e.target.type !== 'radio') {
      this.validate(e.target.name, e.target.value);
    }
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
    // validate extColor
    if (name === 'name' || name === 'extColor') {
      if (value === '') {
        this.setState({ [`${name}Empty`]: true });
        inputContainer.classList.add('error');
        return false;
      } else {
        this.setState({ [`${name}Empty`]: false });
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

    // validate number inputs
    if (
      name === 'printFrontColorCount' ||
      name === 'printBackColorCount' ||
      name === 'cutPunchCount' ||
      name === 'stockQuantity'
    ) {
      if (isNaN(value)) {
        this.setState({ [`${name}Error`]: true });
        inputContainer.classList.add('error');
      } else {
        this.setState({ [`${name}Error`]: false });
        inputContainer.classList.remove('error');
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
    } else if (!this.validate('extColor', this.state.extColor)) {
      this.refs.extColor.focus();
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
      width: this.state.width,
      isPrint: this.state.isPrint,
      extColor: this.state.extColor,
      extAntistatic: this.state.extAntistatic,
      extPretreat: this.state.extPretreat,
      extMemo: this.state.extMemo,
      printImageFile: this.state.printImageFile,
      printFrontColorCount: this.state.printFrontColorCount,
      printFrontColor: this.state.printFrontColor,
      printFrontPosition: this.state.printFrontPosition,
      printBackColorCount: this.state.printBackColorCount,
      printBackColor: this.state.printBackColor,
      printBackPosition: this.state.printBackPosition,
      printMemo: this.state.printMemo,
      cutPosition: this.state.cutPosition,
      cutUltrasonic: this.state.cutUltrasonic,
      cutPowderPack: this.state.cutPowderPack,
      cutPunches: this.state.cutPunches,
      cutPunchCount: this.state.cutPunchCount,
      cutPunchSize: this.state.cutPunchSize,
      cutPunchPosition: this.state.cutPunchPosition,
      cutMemo: this.state.cutMemo,
      packMaterial: this.state.packMaterial,
      packQuantity: this.state.packQuantity,
      packDeliverAll: this.state.packDeliverAll,
      packMemo: this.state.packMemo,
      stockQuantity: this.state.stockQuantity,
      price: this.state.price,
      history: this.state.history,
      memo: this.state.memo,
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
        <form className="boxed-view__content product-modal__content">
          <Accordion title="기본정보" />
          <div className="accordion-panel open">
            <FormElement
              tagName="input"
              inputType="text"
              id="accountName"
              label="업체명"
              value={this.state.accountName}
              onInputChange={this.onInputChange}
              listID="accountNameList"
              errorMessage={
                this.state.accountNameEmpty
                  ? '업체명을 입력하세요.'
                  : this.state.accountNameError
                    ? '존재하지 않는 업체입니다.'
                    : undefined
              }
            />
            <datalist id="accountNameList">{this.getAccountNameList()}</datalist>
            <FormElement
              tagName="input"
              inputType="text"
              id="name"
              label="제품명"
              value={this.state.name}
              onInputChange={this.onInputChange}
              errorMessage={
                this.state.nameEmpty ? '제품명을 입력하세요.' : undefined
              }
            />
            <FormElement
              containerClassName="form-element-container product-size"
              tagName="input"
              inputType="text"
              id="thick"
              label="두께"
              value={this.state.thick}
              onInputChange={this.onInputChange}
              errorMessage={
                this.state.thickEmpty
                  ? '두께를 입력하세요.'
                  : this.state.thickError ? '숫자만 입력 가능합니다.' : undefined
              }
            />
            <FormElement
              containerClassName="form-element-container product-size"
              tagName="input"
              inputType="text"
              id="length"
              label="길이"
              value={this.state.length}
              onInputChange={this.onInputChange}
              errorMessage={
                this.state.lengthEmpty
                  ? '길이(원단)를 입력하세요.'
                  : this.state.lengthError ? '숫자만 입력 가능합니다.' : undefined
              }
            />
            <FormElement
              containerClassName="form-element-container product-size"
              tagName="input"
              inputType="text"
              id="width"
              label="너비"
              value={this.state.width}
              onInputChange={this.onInputChange}
              errorMessage={
                this.state.widthEmpty
                  ? '너비(가공)를 입력하세요.'
                  : this.state.widthError ? '숫자만 입력 가능합니다.' : undefined
              }
            />

            <div className="form-element-container">
              <div className="form-element__label">
                <label>무지/인쇄</label>
              </div>
              <RadioButton
                name="isPrint"
                label="무지"
                value="isPrintFalse"
                checked={!this.state.isPrint}
                onInputChange={this.onInputChange}
              />
              <RadioButton
                name="isPrint"
                label="인쇄"
                value="isPrintTrue"
                checked={this.state.isPrint}
                onInputChange={this.onInputChange}
              />
            </div>
          </div>

          <Accordion title="압출" />
          <div className="accordion-panel open">
            <FormElement
              tagName="input"
              inputType="text"
              id="extColor"
              label="원단색상"
              value={this.state.extColor}
              onInputChange={this.onInputChange}
              errorMessage={
                this.state.extColorEmpty ? '원단색상을 입력하세요.' : undefined
              }
            />
            <div className="form-element-container">
              <div className="form-element__label">
                <label>처리</label>
              </div>
              <Checkbox
                name="extAntistatic"
                label="대전방지"
                checked={this.state.extAntistatic}
                onInputChange={this.onInputChange}
              />
              <RadioButton
                name="extPretreat"
                label="인쇄단면"
                value="single"
                disabled={!this.state.isPrint}
                checked={this.state.extPretreat === 'single' ? true : false}
                onInputChange={this.onInputChange}
              />
              <RadioButton
                name="extPretreat"
                label="인쇄양면"
                value="both"
                disabled={!this.state.isPrint}
                checked={this.state.extPretreat === 'both' ? true : false}
                onInputChange={this.onInputChange}
              />
            </div>
            <FormElement
              tagName="Textarea"
              id="extMemo"
              label="압출참고"
              value={this.state.extMemo}
              onInputChange={this.onInputChange}
            />
          </div>

          {this.state.isPrint ? <Accordion title="인쇄" /> : undefined}
          {this.state.isPrint ? (
            <div className="accordion-panel open">
              <FormElement
                tagName="input"
                inputType="file"
                id="printImageFile"
                label="도안"
                value={this.state.printImageFile}
                onInputChange={this.onInputChange}
              />
              <FormElement
                tagName="input"
                inputType="text"
                id="printFrontColorCount"
                label="전면도수"
                value={this.state.printFrontColorCount}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.printFrontColorCountError
                    ? '숫자로 입력하세요.'
                    : undefined
                }
              />
              <FormElement
                tagName="input"
                inputType="text"
                id="printFrontColor"
                label="전면색상"
                value={this.state.printFrontColor}
                onInputChange={this.onInputChange}
              />
              <FormElement
                tagName="input"
                inputType="text"
                id="printFrontPosition"
                label="전면인쇄위치"
                value={this.state.printFrontPosition}
                onInputChange={this.onInputChange}
              />
              <FormElement
                tagName="input"
                inputType="text"
                id="printBackColorCount"
                label="후면도수"
                value={this.state.printBackColorCount}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.printBackColorCountError
                    ? '숫자로 입력하세요.'
                    : undefined
                }
              />
              <FormElement
                tagName="input"
                inputType="text"
                id="printBackColor"
                label="후면색상"
                value={this.state.printBackColor}
                onInputChange={this.onInputChange}
              />
              <FormElement
                tagName="input"
                inputType="text"
                id="printBackPosition"
                label="후면인쇄위치"
                value={this.state.printBackPosition}
                onInputChange={this.onInputChange}
              />
              <FormElement
                tagName="Textarea"
                id="printMemo"
                label="인쇄참고"
                value={this.state.printMemo}
                onInputChange={this.onInputChange}
              />
            </div>
          ) : (
            undefined
          )}

          <Accordion title="가공" />
          <div className="accordion-panel open">
            <FormElement
              tagName="input"
              inputType="text"
              id="cutPosition"
              label="가공위치"
              value={this.state.cutPosition}
              onInputChange={this.onInputChange}
            />
            <div className="react-modal__input-container">
              <div className="label-container">
                <label>가공추가</label>
              </div>
              <Checkbox
                name="cutUltrasonic"
                label="초음파가공"
                checked={this.state.cutUltrasonic}
                onInputChange={this.onInputChange}
              />
              <Checkbox
                name="cutPowderPack"
                label="가루포장"
                checked={this.state.cutPowderPack}
                onInputChange={this.onInputChange}
              />
            </div>
            <div className="react-modal__input-container">
              <div className="label-container">
                <label>바람구멍</label>
              </div>
              <Checkbox
                name="cutPunches"
                checked={this.state.cutPunches}
                onInputChange={this.onInputChange}
              />
            </div>
            {this.state.cutPunches ? (
              <FormElement
                tagName="input"
                inputType="text"
                id="cutPunchCount"
                label="바람구멍개수"
                value={this.state.cutPunchCount}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.cutPunchCountError
                    ? '숫자로 입력하세요.'
                    : undefined
                }
              />
            ) : (
              undefined
            )}

            {this.state.cutPunches ? (
              <FormElement
                tagName="input"
                inputType="text"
                id="cutPunchSize"
                label="바람구멍크기"
                value={this.state.cutPunchSize}
                onInputChange={this.onInputChange}
              />
            ) : (
              undefined
            )}

            {this.state.cutPunches ? (
              <FormElement
                tagName="input"
                inputType="text"
                id="cutPunchPosition"
                label="바람구멍위치"
                value={this.state.cutPunchCount}
                onInputChange={this.onInputChange}
              />
            ) : (
              undefined
            )}

            <FormElement
              tagName="Textarea"
              id="cutMemo"
              label="가공참고"
              value={this.state.cutMemo}
              onInputChange={this.onInputChange}
            />
          </div>

          <Accordion title="포장" />
          <div className="accordion-panel open">
            <FormElement
              tagName="input"
              inputType="text"
              id="packMaterial"
              label="포장방법"
              value={this.state.packMaterial}
              onInputChange={this.onInputChange}
            />
            <FormElement
              tagName="input"
              inputType="text"
              id="packQuantity"
              label="포장단위"
              value={this.state.packQuantity}
              onInputChange={this.onInputChange}
            />
            <div className="react-modal__input-container">
              <div className="label-container">
                <label>전량납품</label>
              </div>
              <Checkbox
                name="packDeliverAll"
                checked={this.state.packDeliverAll}
                onInputChange={this.onInputChange}
              />
            </div>
            <FormElement
              tagName="Textarea"
              id="packMemo"
              label="포장참고"
              value={this.state.packMemo}
              onInputChange={this.onInputChange}
            />
          </div>

          {this.props.isAdmin || this.props.isManager ? (
            <Accordion title="관리자 참고사항" />
          ) : (
            undefined
          )}
          {this.props.isAdmin || this.props.isManager ? (
            <div className="accordion-panel open">
              <FormElement
                tagName="input"
                inputType="text"
                id="stockQuantity"
                label="재고수량"
                value={this.state.stockQuantity}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.stockQuantityError
                    ? '숫자로 입력하세요.'
                    : undefined
                }
              />
              <FormElement
                tagName="input"
                inputType="text"
                id="price"
                label="단가"
                value={this.state.price}
                onInputChange={this.onInputChange}
              />
              <FormElement
                tagName="Textarea"
                id="history"
                label="작업이력"
                value={this.state.history}
                onInputChange={this.onInputChange}
              />
              <FormElement
                tagName="Textarea"
                id="memo"
                label="메모"
                value={this.state.memo}
                onInputChange={this.onInputChange}
              />
            </div>
          ) : (
            undefined
          )}

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
