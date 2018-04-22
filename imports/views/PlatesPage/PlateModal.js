import React from 'react';
import Modal from 'react-modal';
import moment from 'moment';

import { ProductsData } from '../../api/products';

import TextInput from '../../custom/TextInput';
import Textarea from '../../custom/Textarea';
import AddProductModal from './AddProductModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default class PlateModal extends React.Component {
  /*========================================================================
  >> props <<
  isOpen       : if modal is open
  plateID      : plate ID to edit
  onModalClose : function to execute on modal close
  isAdmin
  isManager
  ========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: props.isAdmin,
      isManager: props.isManager,
      productsData: [],
      mode: 'ADDNEW',
      name: '',
      round: '',
      length: '',
      material: '',
      location: '',
      forProductList: [], // [ productID, content ],
      history: [], // [ date, memo ]
      memo: '',
      nameEmpty: false,
      roundEmpty: false,
      roundError: false,
      lengthEmpty: false,
      lengthError: false,
      isConfirmationModalOpen: false,
      confirmationTitle: '',
      confirmationDescription: [],
      isAddProductModalOpen: false,
      error: ''
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onConfirmationModalClose = this.onConfirmationModalClose.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.onClickAddProduct = this.onClickAddProduct.bind(this);
    this.onAddProductModalClose = this.onAddProductModalClose.bind(this);
    this.onProductRemoveButtonClick = this.onProductRemoveButtonClick.bind(
      this
    );
  }

  componentDidMount() {
    // tracks data change
    this.databaseTracker = Tracker.autorun(() => {
      Meteor.subscribe('products');
      const productsData = ProductsData.find({}, { sort: { name: 1 } }).fetch();

      this.setState({ productsData });
    });
  }

  componentWillUnmount() {
    this.databaseTracker.stop();
  }

  validate(name, value) {
    const inputContainer = document.getElementById(name).parentNode;

    switch (name) {
      case 'name':
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

      case 'round':
      case 'length':
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
        break;
    }
  }

  onInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
    this.validate(e.target.name, e.target.value);
  }

  onClickOK(e) {
    e.preventDefault();
    if (!this.validate('name', this.state.name)) {
      document.getElementById('name').focus();
    } else if (!this.validate('round', this.state.round)) {
      document.getElementById('round').focus();
    } else if (!this.validate('length', this.state.length)) {
      document.getElementById('length').focus();
    } else if (this.state.forProductList.length === 0) {
      this.setState({ error: '1개 이상의 사용 품목을 등록해야 합니다.' });
    } else {
      if (this.state.mode === 'ADDNEW') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '동판 신규 등록',
          confirmationDescription: ['신규 등록 하시겠습니까?', this.state.name]
        });
      }
    }
  }

  getDataToSave() {
    let history = [];
    if (this.state.mode === 'ADDNEW') {
      history = [
        { date: moment().format('YYYY-MM-DD'), memo: '동판 신규 등록' }
      ];
    }
    return {
      name: this.state.name,
      round: this.state.round,
      length: this.state.length,
      material: this.state.material,
      location: this.state.location,
      forProductList: this.state.forProductList, // [ productID, content ],
      history, // [ date, memo ]
      memo: ''
    };
  }

  onConfirmationModalClose(answer) {
    if (this.state.mode === 'ADDNEW' && answer) {
      this.setState({
        isConfirmationModalOpen: false,
        confirmationTitle: '',
        confirmationDescription: []
      });

      const data = this.getDataToSave();

      Meteor.call('plates.insert', data, (err, res) => {
        if (!err) {
          this.props.onModalClose();
        } else {
          this.setState({ error: err.message });
        }
      });
    }
  }

  onClickCancel(e) {
    e.preventDefault();
    this.props.onModalClose();
  }

  onClickAddProduct(e) {
    e.preventDefault();
    this.setState({ isAddProductModalOpen: true, error: '' });
  }

  onAddProductModalClose(selectedProductID, printContent) {
    this.setState({ isAddProductModalOpen: false });
    if (selectedProductID) {
      const forProductList = this.state.forProductList;
      forProductList.push({
        productID: selectedProductID,
        printContent
      });
      this.setState({ forProductList });
    }
  }

  onProductRemoveButtonClick(e) {
    e.preventDefault();
    let selectedProductID = '';
    if (e.target.tagName === 'I') {
      selectedProductID = e.target.parentNode.parentNode.id;
    } else if (e.target.tagName === 'BUTTON') {
      selectedProductID = e.target.parentNode.id;
    }

    let updatedForProductList = [];
    this.state.forProductList.map(({ productID, printContent }) => {
      if (selectedProductID !== productID) {
        updatedForProductList.push({ productID, printContent });
      }
    });

    this.setState({ forProductList: updatedForProductList });
  }

  getForProductList() {
    if (this.state.forProductList) {
      return this.state.forProductList.map(({ productID, printContent }) => {
        const product = this.state.productsData.find(
          product => product._id === productID
        );
        const productSize = `
            ${product.thick} x ${product.length} x ${product.width}
          `;

        return (
          <li
            id={product._id}
            key={product._id}
            className="plate-modal__forProductList__item"
          >
            <div className="plate-modal__forProductList__item__productInfo">
              <span>{product.accountName}</span>
              <span>{product.name}</span>
              <span>{productSize}</span>
              <span>{printContent}</span>
            </div>
            <button
              className="plate-modal__forProductList__item__removeButton"
              onClick={this.onProductRemoveButtonClick}
            >
              <i className="fa fa-times" />
            </button>
          </li>
        );
      });
    }
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
        className="boxed-view__box plate-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>
            {this.state.mode === 'ADDNEW' ? '동판 등록' : undefined}
            {this.state.mode === 'EDIT' ? '동판 정보수정' : undefined}
          </h1>
        </div>
        <form className="boxed-view__content">
          <div className="form-element-container plate-modal__plateName-container">
            <div className="form-element__label plate-modal__label">
              <label htmlFor="name">동판명</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element"
                inputType="text"
                id="name"
                value={this.state.name}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.nameEmpty ? '동판명을 입력하세요.' : undefined
                }
              />
            </div>
          </div>
          <div className="form-element-container plate-modal__size-container">
            <div className="form-element__label plate-modal__label">
              <label htmlFor="round">규격</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element plate-modal__size-input"
                inputType="text"
                id="round"
                value={this.state.round}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.roundEmpty
                    ? '둘레를 입력하세요.'
                    : this.state.roundError
                      ? '숫자만 입력 가능합니다.'
                      : undefined
                }
              />
              <i
                className="fa fa-times"
                style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}
              />
              <TextInput
                className="form-element plate-modal__size-input"
                inputType="text"
                id="length"
                value={this.state.length}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.lengthEmpty
                    ? '기장을 입력하세요.'
                    : this.state.lengthError
                      ? '숫자만 입력 가능합니다.'
                      : undefined
                }
              />
            </div>
          </div>
          <div className="form-element-container plate-modal__location-container">
            <div className="form-element__label plate-modal__label">
              <label htmlFor="location">위치</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element"
                inputType="text"
                id="location"
                value={this.state.location}
                onInputChange={this.onInputChange}
              />
            </div>
          </div>
          <div className="form-element-container plate-modal__material-container">
            <div className="form-element__label plate-modal__label">
              <label htmlFor="material">구분</label>
            </div>
            <div className="form-elements">
              <select
                className="select plate-modal__material-select"
                id="material"
                name="material"
                value={this.state.material}
                onChange={this.onInputChange}
              >
                <option value="brass">신주</option>
                <option value="iron">데스</option>
              </select>
            </div>
          </div>
          {this.state.forProductList.length > 0 ? (
            <div className="form-element-container plate-modal__forProductList-container">
              <div className="form-element__label plate-modal__label">
                <label>품목</label>
              </div>

              <ul
                id="plate-modal__forProductList"
                className="plate-modal__forProductList"
              >
                {this.getForProductList()}
              </ul>
            </div>
          ) : (
            undefined
          )}
          <button
            className="button product-modal__addProductButton"
            onClick={this.onClickAddProduct}
          >
            사용품목추가
          </button>
          <div className="form-element-container plate-modal__memo-container">
            <div className="form-element__label plate-modal__label">
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

          {this.state.error ? (
            <p className="plate-modal__error">{this.state.error}</p>
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

        {this.state.isAddProductModalOpen ? (
          <AddProductModal
            isOpen={this.state.isAddProductModalOpen}
            onModalClose={this.onAddProductModalClose}
          />
        ) : (
          undefined
        )}

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
