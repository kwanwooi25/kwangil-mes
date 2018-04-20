import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot';
import React from 'react';
import Modal from 'react-modal';

import { AccountsData } from '../../api/accounts';
import { ProductsData } from '../../api/products';
import { uploadToS3 } from '../../api/s3';
import { comma, uncomma } from '../../api/comma';

import TextInput from '../../custom/TextInput';
import Textarea from '../../custom/Textarea';
import RadioButton from '../../custom/RadioButton';
import Checkbox from '../../custom/Checkbox';
import Accordion from '../../custom/Accordion';
import ConfirmationModal from '../components/ConfirmationModal';

export default class ProductModal extends React.Component {
  /*========================================================================
  >> props <<
  isOpen       : if modal is open
  productID    : product ID to display
  onModalClose : function to execute on modal close
  isAdmin
  isManager
  ========================================================================*/
  constructor(props) {
    super(props);

    if (props.productID) {
      // EDIT mode
      const product = ProductsData.findOne({ _id: props.productID });
      initialState = {
        mode: 'EDIT',
        productID: product._id,
        accountList: [],
        accountID: product.accountID,
        accountName: product.accountName,
        name: product.name,
        thick: product.thick,
        length: product.length,
        width: product.width,
        isPrint: product.isPrint,
        extColor: product.extColor,
        extAntistatic: product.extAntistatic,
        extPretreat: product.extPretreat,
        extMemo: product.extMemo,
        printImageFile: '',
        printImagaFileName: product.printImageFileName,
        printImageURL: product.printImageURL,
        printFrontColorCount: product.printFrontColorCount,
        printFrontColor: product.printFrontColor,
        printFrontPosition: product.printFrontPosition,
        printBackColorCount: product.printBackColorCount,
        printBackColor: product.printBackColor,
        printBackPosition: product.printBackPosition,
        printMemo: product.printMemo,
        cutPosition: product.cutPosition,
        cutUltrasonic: product.cutUltrasonic,
        cutPowderPack: product.cutPowderPack,
        cutPunches: product.cutPunches,
        cutPunchCount: product.cutPunchCount,
        cutPunchSize: product.cutPunchSize,
        cutPunchPosition: product.cutPunchPosition,
        cutMemo: product.cutMemo,
        packMaterial: product.packMaterial,
        packQuantity: product.packQuantity,
        packDeliverAll: product.packDeliverAll,
        packMemo: product.packMemo,
        stockQuantity: product.stockQuantity,
        price: product.price,
        history: product.history,
        memo: product.memo,
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
        packQuantityError: false,
        stockQuantityError: false,
        priceError: false,
        isConfirmationModalOpen: false,
        confirmationTitle: '',
        confirmationDescription: []
      };
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
        extPretreat: '', // 'single': 단면, 'both': 양면
        extMemo: '',
        printImageFile: '',
        printImageFileName: '',
        printImageURL: '',
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
        cutMemo: '',
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
        packQuantityError: false,
        stockQuantityError: false,
        priceError: false,
        isConfirmationModalOpen: false,
        confirmationTitle: '',
        confirmationDescription: []
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
    if (e.target.type === 'radio') {
      switch (e.target.name) {
        case 'isPrint':
          const value = e.target.value === 'isPrintTrue' ? true : false;
          this.setState({ [e.target.name]: value });
          if (value) {
            if (this.state.extPretreat === '')
              this.setState({ extPretreat: 'single' });
          } else {
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
          break;

        case 'extPretreat':
          if (e.target.value === 'single') {
            this.setState({
              extPretreat: e.target.value,
              printBackColorCount: '',
              printBackColor: '',
              printBackPosition: ''
            });
          } else if (e.target.value === 'both') {
            this.setState({ extPretreat: e.target.value });
          }
          break;
      }
    } else if (e.target.type === 'checkbox') {
      this.setState({ [e.target.name]: e.target.checked });

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
    } else if (e.target.type === 'file') {
      if (e.target.files[0]) {
        const file = e.target.files[0];
        const printImageFileName = e.target.value.replace(/^.*[\\\/]/, '');
        const reader = new FileReader();

        reader.onload = e => {
          this.setState({
            printImageFile: e.target.result,
            printImageFileName
          });
        };
        reader.readAsDataURL(file);
      } else {
        this.setState({ printImageFile: '', printImageFileName: '' });
      }
    } else if (e.target.name === 'packQuantity') {
      this.setState({
        [e.target.name]: comma(uncomma(e.target.value))
      });
    } else {
      this.setState({ [e.target.name]: e.target.value });
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
      name === 'packQuantity' ||
      name === 'stockQuantity' ||
      name === 'price'
    ) {
      if (isNaN(uncomma(value))) {
        this.setState({ [`${name}Error`]: true });
        inputContainer.classList.add('error');
      } else {
        this.setState({ [`${name}Error`]: false });
        inputContainer.classList.remove('error');
      }
    }
  }

  uploadImage(file) {
    const uploader = new Slingshot.Upload('upload-product-image');
    return uploadToS3(file, uploader);
  }

  onClickOK(e) {
    e.preventDefault();

    // validation
    if (!this.validate('accountName', this.state.accountName)) {
      document.getElementById('accountName').focus();
    } else if (!this.validate('name', this.state.name)) {
      document.getElementById('name').focus();
    } else if (!this.validate('thick', this.state.thick)) {
      document.getElementById('thick').focus();
    } else if (!this.validate('length', this.state.length)) {
      document.getElementById('length').focus();
    } else if (!this.validate('width', this.state.width)) {
      document.getElementById('width').focus();
    } else if (!this.validate('extColor', this.state.extColor)) {
      document.getElementById('extColor').focus();
    } else {
      if (this.state.mode === 'ADDNEW') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '제품 신규 등록',
          confirmationDescription: ['신규 등록 하시겠습니까?']
        });
      } else if (this.state.mode === 'EDIT') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '제품 정보 수정',
          confirmationDescription: ['수정하신 내용을 저장하시겠습니까?']
        });
      }
    }
  }

  getDataToSave() {
    return {
      accountID: this.state.accountID,
      accountName: this.state.accountName,
      name: this.state.name,
      thick: this.state.thick,
      length: this.state.length,
      width: this.state.width,
      isPrint: this.state.isPrint,
      extColor: this.state.extColor,
      extAntistatic: this.state.extAntistatic,
      extPretreat: this.state.extPretreat,
      extMemo: this.state.extMemo,
      printImageFileName: this.state.printImageFileName,
      printImageURL: this.state.printImageURL,
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
      packQuantity: uncomma(this.state.packQuantity),
      packDeliverAll: this.state.packDeliverAll,
      packMemo: this.state.packMemo,
      stockQuantity: this.state.stockQuantity,
      price: this.state.price,
      history: this.state.history,
      memo: this.state.memo
    };
  }

  onConfirmationModalClose(answer) {
    this.setState({ isConfirmationModalOpen: false });

    // ADDNEW mode
    if (this.state.mode === 'ADDNEW' && answer) {
      if (this.refs.printImageFile && this.refs.printImageFile.files[0]) {
        this.uploadImage(this.refs.printImageFile.files[0]).then(
          convertedURL => {
            this.setState({ printImageURL: convertedURL }, () => {
              const data = this.getDataToSave();
              Meteor.call('products.insert', data, (err, res) => {
                if (!err) {
                  this.props.onModalClose();
                } else {
                  this.setState({ error: err.error });
                }
              });
            });
          }
        );
      } else {
        const data = this.getDataToSave();
        Meteor.call('products.insert', data, (err, res) => {
          if (!err) {
            this.props.onModalClose();
          } else {
            this.setState({ error: err.error });
          }
        });
      }

      // EDIT mode
    } else if (this.state.mode === 'EDIT' && answer) {
      if (
        initialState.printImageFileName !== this.state.printImageFileName &&
        this.refs.printImageFile.files[0]
      ) {
        this.uploadImage(this.refs.printImageFile.files[0]).then(
          convertedURL => {
            this.setState({ printImageURL: convertedURL }, () => {
              const data = this.getDataToSave();
              Meteor.call(
                'products.update',
                this.state.productID,
                data,
                (err, res) => {
                  if (!err) {
                    this.props.onModalClose();
                  } else {
                    this.setState({ error: err.error });
                  }
                }
              );
            });
          }
        );
      } else {
        const data = this.getDataToSave();
        Meteor.call(
          'products.update',
          this.state.productID,
          data,
          (err, res) => {
            if (!err) {
              this.props.onModalClose();
            } else {
              this.setState({ error: err.error });
            }
          }
        );
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
          <div className="accordion-container">
            <Accordion title="기본정보" />
            <div className="accordion-panel open">
              <div className="form-element-group sm50 md60 lg55">
                <div className="form-element-container lg45">
                  <div className="form-element__label">
                    <label htmlFor="accountName">업체명</label>
                  </div>
                  <div className="form-elements">
                    <TextInput
                      className="form-element"
                      inputType="text"
                      id="accountName"
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
                    <datalist id="accountNameList">
                      {this.getAccountNameList()}
                    </datalist>
                  </div>
                </div>
                <div className="form-element-container lg50">
                  <div className="form-element__label">
                    <label htmlFor="name">제품명</label>
                  </div>
                  <div className="form-elements">
                    <TextInput
                      className="form-element"
                      inputType="text"
                      id="name"
                      value={this.state.name}
                      onInputChange={this.onInputChange}
                      errorMessage={
                        this.state.nameEmpty
                          ? '제품명을 입력하세요.'
                          : undefined
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-element-group sm50 md40 lg45">
                <div className="form-element-container lg60">
                  <div className="form-element__label">
                    <label htmlFor="thick">규격</label>
                  </div>
                  <div className="form-elements product-modal__size-container">
                    <TextInput
                      className="form-element product-modal__size"
                      inputType="text"
                      id="thick"
                      value={this.state.thick}
                      onInputChange={this.onInputChange}
                      errorMessage={
                        this.state.thickEmpty
                          ? '두께를 입력하세요.'
                          : this.state.thickError
                            ? '숫자만 입력 가능합니다.'
                            : undefined
                      }
                    />
                    <i className="fa fa-times" />
                    <TextInput
                      className="form-element product-modal__size"
                      inputType="text"
                      id="length"
                      value={this.state.length}
                      onInputChange={this.onInputChange}
                      errorMessage={
                        this.state.lengthEmpty
                          ? '길이(원단)를 입력하세요.'
                          : this.state.lengthError
                            ? '숫자만 입력 가능합니다.'
                            : undefined
                      }
                    />
                    <i className="fa fa-times" />
                    <TextInput
                      className="form-element product-modal__size"
                      inputType="text"
                      id="width"
                      value={this.state.width}
                      onInputChange={this.onInputChange}
                      errorMessage={
                        this.state.widthEmpty
                          ? '너비(가공)를 입력하세요.'
                          : this.state.widthError
                            ? '숫자만 입력 가능합니다.'
                            : undefined
                      }
                    />
                  </div>
                </div>

                <div className="form-element-container lg35">
                  <div className="form-elements product-modal__isPrint">
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
              </div>
            </div>
          </div>

          <div className="accordion-container">
            <Accordion title="압출" />
            <div className="accordion-panel open">
              <div className="form-element-group sm50 md60">
                <div className="form-element-container lg45">
                  <div className="form-element__label">
                    <label htmlFor="extColor">원단색상</label>
                  </div>
                  <div className="form-elements">
                    <TextInput
                      className="form-element"
                      inputType="text"
                      id="extColor"
                      value={this.state.extColor}
                      onInputChange={this.onInputChange}
                      errorMessage={
                        this.state.extColorEmpty
                          ? '원단색상을 입력하세요.'
                          : undefined
                      }
                    />
                  </div>
                </div>
                <div className="form-element-container lg50">
                  <div className="form-elements product-modal__pretreat">
                    <RadioButton
                      name="extPretreat"
                      label="인쇄단면"
                      value="single"
                      disabled={!this.state.isPrint}
                      checked={
                        this.state.extPretreat === 'single' ? true : false
                      }
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
                    <Checkbox
                      name="extAntistatic"
                      label="대전방지"
                      checked={this.state.extAntistatic}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-element-group sm50 md40">
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label htmlFor="extMemo">압출참고</label>
                  </div>
                  <div className="form-elements">
                    <Textarea
                      className="form-element"
                      id="extMemo"
                      value={this.state.extMemo}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {this.state.isPrint ? (
            <div className="accordion-container">
              <Accordion title="인쇄" />
              <div className="accordion-panel open">
                <div className="form-element-container upload-area md45 lg35">
                  <p className="upload-alert">
                    {this.state.printImageFile ? (
                      <img id="printImage" src={this.state.printImageFile} />
                    ) : this.state.printImageURL ? (
                      <img id="printImage" src={this.state.printImageURL} />
                    ) : (
                      <span>클릭하거나 파일 끌어다놓기</span>
                    )}
                    <input
                      type="file"
                      id="printImageFile"
                      ref="printImageFile"
                      name="printImageFile"
                      onChange={this.onInputChange}
                    />
                  </p>
                </div>
                <div className="form-element-group md50 lg60">
                  <div className="form-element-container">
                    <div className="form-element__label">
                      <label>전면</label>
                    </div>
                    <div className="form-elements product-modal__print-detail-container">
                      <TextInput
                        className="form-element product-modal__color-count"
                        inputType="text"
                        id="printFrontColorCount"
                        value={this.state.printFrontColorCount}
                        onInputChange={this.onInputChange}
                        errorMessage={
                          this.state.printFrontColorCountError
                            ? '숫자로 입력하세요.'
                            : undefined
                        }
                      />
                      <label htmlFor="printFrontColorCount">도, </label>
                      <label htmlFor="printFrontColor">색상:</label>
                      <TextInput
                        className="form-element product-modal__color"
                        inputType="text"
                        id="printFrontColor"
                        value={this.state.printFrontColor}
                        onInputChange={this.onInputChange}
                      />
                      <label htmlFor="printFrontPosition">인쇄위치:</label>
                      <TextInput
                        className="form-element product-modal__print-position"
                        inputType="text"
                        id="printFrontPosition"
                        value={this.state.printFrontPosition}
                        onInputChange={this.onInputChange}
                      />
                    </div>
                  </div>

                  {this.state.extPretreat === 'both' ? (
                    <div className="form-element-container">
                      <div className="form-element__label">
                        <label>후면</label>
                      </div>
                      <div className="form-elements product-modal__print-detail-container">
                        <TextInput
                          className="form-element product-modal__color-count"
                          inputType="text"
                          id="printBackColorCount"
                          value={this.state.printBackColorCount}
                          onInputChange={this.onInputChange}
                          errorMessage={
                            this.state.printBackColorCountError
                              ? '숫자로 입력하세요.'
                              : undefined
                          }
                        />
                        <label htmlFor="printBackColorCount">도, </label>
                        <label htmlFor="printBackColor">색상:</label>
                        <TextInput
                          className="form-element product-modal__color"
                          inputType="text"
                          id="printBackColor"
                          value={this.state.printBackColor}
                          onInputChange={this.onInputChange}
                        />
                        <label htmlFor="printBackPosition">인쇄위치:</label>
                        <TextInput
                          className="form-element product-modal__print-position"
                          inputType="text"
                          id="printBackPosition"
                          value={this.state.printBackPosition}
                          onInputChange={this.onInputChange}
                        />
                      </div>
                    </div>
                  ) : (
                    undefined
                  )}

                  <div className="form-element-container">
                    <div className="form-element__label">
                      <label htmlFor="printMemo">인쇄참고</label>
                    </div>
                    <div className="form-elements">
                      <Textarea
                        className="form-element"
                        id="printMemo"
                        value={this.state.printMemo}
                        onInputChange={this.onInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            undefined
          )}

          <div className="accordion-container">
            <Accordion title="가공" />
            <div className="accordion-panel open">
              <div className="form-element-group sm50 md60">
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label />
                  </div>
                  <div className="form-elements">
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
                    <Checkbox
                      name="cutPunches"
                      label="바람구멍"
                      checked={this.state.cutPunches}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>

                {this.state.cutPunches ? (
                  <div className="form-element-container">
                    <div className="form-element__label">
                      <label>바람구멍</label>
                    </div>
                    <div className="form-elements product-modal__punch-detail-container">
                      <TextInput
                        className="form-element product-modal__punch-count"
                        inputType="text"
                        id="cutPunchCount"
                        value={this.state.cutPunchCount}
                        onInputChange={this.onInputChange}
                        errorMessage={
                          this.state.cutPunchCountError
                            ? '숫자로 입력하세요.'
                            : undefined
                        }
                      />
                      <label htmlFor="cutPunchCount">개, </label>
                      <label htmlFor="cutPunchSize">크기:</label>
                      <TextInput
                        className="form-element product-modal__punch-size"
                        inputType="text"
                        id="cutPunchSize"
                        value={this.state.cutPunchSize}
                        onInputChange={this.onInputChange}
                      />
                      <label htmlFor="cutPunchPosition">위치:</label>
                      <TextInput
                        className="form-element product-modal__punch-position"
                        inputType="text"
                        id="cutPunchPosition"
                        value={this.state.cutPunchPosition}
                        onInputChange={this.onInputChange}
                      />
                    </div>
                  </div>
                ) : (
                  undefined
                )}
              </div>
              <div className="form-element-group sm50 md40">
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label htmlFor="cutPosition">가공위치</label>
                  </div>
                  <div className="form-elements">
                    <TextInput
                      className="form-element"
                      inputType="text"
                      id="cutPosition"
                      value={this.state.cutPosition}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label htmlFor="cutMemo">가공참고</label>
                  </div>
                  <div className="form-elements">
                    <Textarea
                      className="form-element"
                      id="cutMemo"
                      value={this.state.cutMemo}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="accordion-container">
            <Accordion title="포장" />
            <div className="accordion-panel open">
              <div className="form-element-group sm50">
                <div className="form-element-container lg50">
                  <div className="form-element__label">
                    <label htmlFor="packMaterial">방법</label>
                  </div>
                  <div className="form-elements">
                    <TextInput
                      className="form-element"
                      inputType="text"
                      id="packMaterial"
                      value={this.state.packMaterial}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>
                <div className="form-element-container lg45">
                  <div className="form-element__label">
                    <label htmlFor="packQuantity">단위</label>
                  </div>
                  <div className="form-elements">
                    <TextInput
                      className="form-element"
                      inputType="text"
                      id="packQuantity"
                      value={this.state.packQuantity}
                      onInputChange={this.onInputChange}
                      errorMessage={
                        this.state.packQuantityError
                          ? '숫자로 입력하세요.'
                          : undefined
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-element-group sm50">
                <div className="form-element-container lg25">
                  <div className="form-elements product-modal__deliverAll">
                    <Checkbox
                      name="packDeliverAll"
                      label="전량납품"
                      checked={this.state.packDeliverAll}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>
                <div className="form-element-container lg70">
                  <div className="form-element__label">
                    <label htmlFor="packMemo">포장참고</label>
                  </div>
                  <div className="form-elements">
                    <Textarea
                      className="form-element"
                      id="packMemo"
                      value={this.state.packMemo}
                      onInputChange={this.onInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {this.props.isAdmin || this.props.isManager ? (
            <div className="accordion-container">
              <Accordion title="관리자 참고사항" />
              <div className="accordion-panel open">
                <div className="form-element-group sm40 lg60">
                  <div className="form-element-container lg45">
                    <div className="form-element__label">
                      <label htmlFor="price">단가</label>
                    </div>
                    <div className="form-elements">
                      <TextInput
                        className="form-element"
                        inputType="text"
                        id="price"
                        value={this.state.price}
                        onInputChange={this.onInputChange}
                        errorMessage={
                          this.state.priceError
                            ? '숫자로 입력하세요.'
                            : undefined
                        }
                      />
                    </div>
                  </div>

                  {this.state.mode === 'EDIT' ? (
                    <div className="form-element-container lg50">
                      <div className="form-element__label">
                        <label htmlFor="stockQuantity">재고수량</label>
                      </div>
                      <div className="form-elements">
                        <TextInput
                          className="form-element"
                          inputType="text"
                          id="stockQuantity"
                          value={this.state.stockQuantity}
                          onInputChange={this.onInputChange}
                          errorMessage={
                            this.state.stockQuantityError
                              ? '숫자로 입력하세요.'
                              : undefined
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    undefined
                  )}
                </div>

                <div className="form-element-group sm60 lg40">
                  {this.state.mode === 'EDIT' ? (
                    <div className="form-element-container">
                      <div className="form-element__label">
                        <label htmlFor="history">작업이력</label>
                      </div>
                      <div className="form-elements">
                        <TextInput
                          className="form-element"
                          inputType="text"
                          id="history"
                          value={this.state.history}
                          onInputChange={this.onInputChange}
                        />
                      </div>
                    </div>
                  ) : (
                    undefined
                  )}

                  <div className="form-element-container">
                    <div className="form-element__label">
                      <label htmlFor="memo">메모</label>
                    </div>
                    <div className="form-elements">
                      <Textarea
                        className="form-element"
                        id="memo"
                        value={this.state.memo}
                        onInputChange={this.onInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            undefined
          )}

          {this.state.error ? (
            <p className="product-modal__error">{this.state.error}</p>
          ) : (
            undefined
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
        {this.state.isConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title={this.state.confirmationTitle}
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.onConfirmationModalClose}
          />
        ) : (
          undefined
        )}
      </Modal>
    );
  }
}
