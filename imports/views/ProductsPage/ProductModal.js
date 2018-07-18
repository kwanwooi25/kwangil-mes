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
      const account = AccountsData.findOne({ _id: product.accountID });
      initialState = {
        mode: 'EDIT',
        productID: product._id,
        accountList: [],
        accountID: product.accountID,
        accountName: account ? account.name : '',
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
        printImageFileName: product.printImageFileName,
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
        price: product.price,
        memo: product.memo,
        accountNameEmpty: false,
        accountNameError: false,
        nameEmpty: false,
        thickEmpty: false,
        lengthEmpty: false,
        widthEmpty: false,
        extColorEmpty: false,
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
        price: '',
        memo: '',
        accountNameEmpty: false,
        accountNameError: false,
        nameEmpty: false,
        thickEmpty: false,
        lengthEmpty: false,
        widthEmpty: false,
        extColorEmpty: false,
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
      initialState[e.target.name] != e.target.value
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
    } else if (e.target.name === 'packQuantity' || e.target.name === 'price') {
      this.setState({
        [e.target.name]: comma(uncomma(e.target.value))
      });
    } else {
      this.setState({ [e.target.name]: e.target.value });
    }

    // check validation
    if (e.target.type !== 'checkbox' && e.target.type !== 'radio') {
      this.validate(e.target.name, e.target.value, e.target.max);
    }
  }

  validate(name, value, max) {
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
        this.setState({ [`${name}Empty`]: true });
        inputContainer.classList.add('error');
        return false;
      } else if (Number(max) <= Number(value)) {
        this.setState({ [`${name}`]: max });
      } else {
        this.setState({ [`${name}Empty`]: false });
        inputContainer.classList.remove('error');
        return true;
      }
    }

    // validate number inputs
    if (
      name === 'printFrontColorCount' ||
      name === 'printBackColorCount' ||
      name === 'cutPunchCount'
    ) {
      if (Number(max) <= Number(value)) {
        this.setState({ [`${name}`]: max });
      }
    }
  }

  uploadImage = file => {
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
      name: this.state.name,
      thick: Number(this.state.thick),
      length: Number(this.state.length),
      width: Number(this.state.width),
      isPrint: this.state.isPrint,
      extColor: this.state.extColor,
      extAntistatic: this.state.extAntistatic,
      extPretreat: this.state.extPretreat,
      extMemo: this.state.extMemo,
      printImageFileName: this.state.printImageFileName,
      printImageURL: this.state.printImageURL,
      printFrontColorCount: Number(this.state.printFrontColorCount),
      printFrontColor: this.state.printFrontColor,
      printFrontPosition: this.state.printFrontPosition,
      printBackColorCount: Number(this.state.printBackColorCount),
      printBackColor: this.state.printBackColor,
      printBackPosition: this.state.printBackPosition,
      printMemo: this.state.printMemo,
      cutPosition: this.state.cutPosition,
      cutUltrasonic: this.state.cutUltrasonic,
      cutPowderPack: this.state.cutPowderPack,
      cutPunches: this.state.cutPunches,
      cutPunchCount: Number(this.state.cutPunchCount),
      cutPunchSize: this.state.cutPunchSize,
      cutPunchPosition: this.state.cutPunchPosition,
      cutMemo: this.state.cutMemo,
      packMaterial: this.state.packMaterial,
      packQuantity: Number(uncomma(this.state.packQuantity)),
      packDeliverAll: this.state.packDeliverAll,
      packMemo: this.state.packMemo,
      price: Number(uncomma(this.state.price)),
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
        // upload new image
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

        // remove previous image
        Meteor.call('deleteFromS3', initialState.printImageFileName);

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
            {this.state.mode === 'ADDNEW' && '제품 등록'}
            {this.state.mode === 'EDIT' && '제품 정보수정'}
          </h1>
        </div>
        <form className="boxed-view__content product-modal__content">
          <div className="product-modal__subsection">
            <h3 className="product-modal__subtitle">기본정보</h3>
            <div className="form-element-container product-modal__accountName-container">
              <div className="form-element__label">
                <label htmlFor="accountName">업체명</label>
              </div>
              <div className="form-elements">
                <TextInput
                  className="form-element product-modal__accountName"
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
            <div className="form-element-container product-modal__productName-container">
              <div className="form-element__label">
                <label htmlFor="name">제품명</label>
              </div>
              <div className="form-elements">
                <TextInput
                  className="form-element product-modal__productName"
                  inputType="text"
                  id="name"
                  value={this.state.name}
                  onInputChange={this.onInputChange}
                  errorMessage={this.state.nameEmpty && '제품명을 입력하세요.'}
                />
              </div>
            </div>

            <div className="form-element-container product-modal__size-container">
              <div className="form-element__label">
                <label htmlFor="thick">규격</label>
              </div>
              <div className="form-elements">
                <TextInput
                  className="form-element product-modal__size"
                  inputType="number"
                  id="thick"
                  value={this.state.thick}
                  onInputChange={this.onInputChange}
                  errorMessage={this.state.thickEmpty && '두께를 입력하세요.'}
                  min={0.05}
                  max={0.15}
                  step={0.005}
                />
                <i className="fa fa-times" />
                <TextInput
                  className="form-element product-modal__size"
                  inputType="number"
                  id="length"
                  value={this.state.length}
                  onInputChange={this.onInputChange}
                  errorMessage={
                    this.state.lengthEmpty && '길이(원단)를 입력하세요.'
                  }
                  min={6}
                  max={75}
                  step={0.5}
                />
                <i className="fa fa-times" />
                <TextInput
                  className="form-element product-modal__size"
                  inputType="number"
                  id="width"
                  value={this.state.width}
                  onInputChange={this.onInputChange}
                  errorMessage={
                    this.state.widthEmpty && '너비(가공)를 입력하세요.'
                  }
                  min={5}
                  max={70}
                  step={0.5}
                />
              </div>
            </div>

            <div className="form-element-container product-modal__isPrint-container">
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

          <div className="product-modal__subsection">
            <h3 className="product-modal__subtitle">압출</h3>
            <div className="form-element-container product-modal__extColor-container">
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
                    this.state.extColorEmpty && '원단색상을 입력하세요.'
                  }
                />
              </div>
            </div>
            <div className="form-element-container product-modal__pretreat-container">
              <div className="form-elements product-modal__pretreat">
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
                <Checkbox
                  name="extAntistatic"
                  label="대전방지"
                  checked={this.state.extAntistatic}
                  onInputChange={this.onInputChange}
                />
              </div>
            </div>

            <div className="form-element-container product-modal__extMemo-container">
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

          {this.state.isPrint && (
            <div className="product-modal__subsection">
              <h3 className="product-modal__subtitle">인쇄</h3>
              <div className="form-element-container upload-area">
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
              <div className="product-modal__print-detail-column">
                <div className="form-element-container">
                  <div className="form-element__label">
                    <label>전면</label>
                  </div>
                  <div className="form-elements product-modal__print-detail-container">
                    <TextInput
                      className="form-element product-modal__color-count"
                      inputType="number"
                      id="printFrontColorCount"
                      value={this.state.printFrontColorCount}
                      onInputChange={this.onInputChange}
                      min={1}
                      max={4}
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

                {this.state.extPretreat === 'both' && (
                  <div className="form-element-container">
                    <div className="form-element__label">
                      <label>후면</label>
                    </div>
                    <div className="form-elements product-modal__print-detail-container">
                      <TextInput
                        className="form-element product-modal__color-count"
                        inputType="number"
                        id="printBackColorCount"
                        value={this.state.printBackColorCount}
                        onInputChange={this.onInputChange}
                        min={1}
                        max={4}
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
          )}

          <div className="product-modal__subsection">
            <h3 className="product-modal__subtitle">가공</h3>
            <div className="form-element-container product-modal__cutExtra-container">
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

            {this.state.cutPunches && (
              <div className="form-element-container product-modal__punch-detail-container">
                <div className="form-element__label">
                  <label>바람구멍</label>
                </div>
                <div className="form-elements product-modal__punch-detail">
                  <TextInput
                    className="form-element product-modal__punch-count"
                    inputType="number"
                    id="cutPunchCount"
                    value={this.state.cutPunchCount}
                    onInputChange={this.onInputChange}
                    min={1}
                    max={4}
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
                  <label htmlFor="cutPunchPosition">펀치위치:</label>
                  <TextInput
                    className="form-element product-modal__punch-position"
                    inputType="text"
                    id="cutPunchPosition"
                    value={this.state.cutPunchPosition}
                    onInputChange={this.onInputChange}
                  />
                </div>
              </div>
            )}
            <div className="form-element-container product-modal__cutPosition-container">
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
            <div className="form-element-container product-modal__cutMemo-container">
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

          <div className="product-modal__subsection">
            <h3 className="product-modal__subtitle">포장</h3>
            <div className="form-element-container product-modal__packMaterial-container">
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
            <div className="form-element-container product-modal__packQuantity-container">
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
                />
              </div>
            </div>

            <div className="form-element-container product-modal__packDeliverAll-container">
              <div className="form-elements product-modal__deliverAll">
                <Checkbox
                  name="packDeliverAll"
                  label="전량납품"
                  checked={this.state.packDeliverAll}
                  onInputChange={this.onInputChange}
                />
              </div>
            </div>
            <div className="form-element-container product-modal__packMemo-container">
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

          {(this.props.isAdmin || this.props.isManager) && (
            <div className="product-modal__subsection">
              <h3 className="product-modal__subtitle">관리자 참고사항</h3>
              <div className="form-element-container product-modal__price-container">
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
                  />
                </div>
              </div>

              <div className="form-element-container product-modal__memo-container">
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
          )}

          {this.state.error && (
            <p className="product-modal__error">{this.state.error}</p>
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
