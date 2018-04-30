import React from 'react';
import Modal from 'react-modal';
import moment from 'moment';

import { ProductsData } from '../../api/products';
import { PlatesData } from '../../api/plates';

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

    if (props.plateID) {
      // EDIT mode
      const plate = PlatesData.findOne({ _id: props.plateID });
      initialState = {
        isAdmin: props.isAdmin,
        isManager: props.isManager,
        mode: 'EDIT',
        round: plate.round,
        length: plate.length,
        material: plate.material,
        location: plate.location,
        forProductList: plate.forProductList,
        history: plate.history,
        memo: plate.memo,
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
    } else {
      // ADDNEW mode
      initialState = {
        isAdmin: props.isAdmin,
        isManager: props.isManager,
        mode: 'ADDNEW',
        round: '',
        length: '',
        material: 'brass',
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
    }

    this.state = initialState;

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

  validate(name, value) {
    const inputContainer = document.getElementById(name).parentNode;

    switch (name) {
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
    if (
      this.state.mode === 'EDIT' &&
      initialState[e.target.name] !== e.target.value
    ) {
      e.target.parentNode.classList.add('changed');
    } else {
      e.target.parentNode.classList.remove('changed');
    }

    this.setState({ [e.target.name]: e.target.value });
    this.validate(e.target.name, e.target.value);
  }

  onClickOK(e) {
    e.preventDefault();
    if (!this.validate('round', this.state.round)) {
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
          confirmationDescription: ['신규 등록 하시겠습니까?']
        });
      } else if (this.state.mode === 'EDIT') {
        this.setState({
          isConfirmationModalOpen: true,
          confirmationTitle: '동판 정보 수정',
          confirmationDescription: ['수정한 내용을 저장 하시겠습니까?']
        });
      }
    }
  }

  getDataToSave() {
    let history = [];
    if (this.state.mode === 'ADDNEW') {
      history = [
        { date: moment().format('YYYY-MM-DD'), memo: '동판 신규 등록' }
      ];
    } else if (this.state.mode === 'EDIT') {
      let changedText = '변경내용:';
      if (initialState.round !== this.state.round) {
        changedText += ` (둘레: ${initialState.round} > ${this.state.round})`;
      }
      if (initialState.length !== this.state.length) {
        changedText += ` (기장: ${initialState.length} > ${this.state.length})`;
      }
      if (initialState.material !== this.state.material) {
        changedText += ` (구분: ${initialState.material} > ${
          this.state.material
        })`;
      }
      if (initialState.location !== this.state.location) {
        changedText += ` (위치: ${initialState.location} > ${
          this.state.location
        })`;
      }
      if (initialState.forProductList !== this.state.forProductList) {
        changedText += ` (사용품목 변경)`;
      }
      if (initialState.memo !== this.state.memo) {
        changedText += ` (메모: ${initialState.memo} > ${this.state.memo})`;
      }
      history = this.state.history;
      history.push({
        date: moment().format('YYYY-MM-DD'),
        memo: changedText
      });
    }
    return {
      round: Number(this.state.round),
      length: Number(this.state.length),
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
    } else if (this.state.mode === 'EDIT' && answer) {
      this.setState({
        isConfirmationModalOpen: false,
        confirmationTitle: '',
        confirmationDescription: []
      });

      const data = this.getDataToSave();

      Meteor.call('plates.update', this.props.plateID, data, (err, res) => {
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
        const product = ProductsData.findOne({ _id: productID });
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
          document.getElementById('round').select();
        }}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box plate-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>
            {this.state.mode === 'ADDNEW' && '동판 등록'}
            {this.state.mode === 'EDIT' && '동판 정보수정'}
          </h1>
        </div>
        <form className="boxed-view__content">
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
                    : this.state.roundError && '숫자만 입력 가능합니다.'
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
                    : this.state.lengthError && '숫자만 입력 가능합니다.'
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
          {this.state.forProductList.length > 0 && (
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

          {this.state.error && (
            <p className="plate-modal__error">{this.state.error}</p>
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

        {this.state.isAddProductModalOpen && (
          <AddProductModal
            isOpen={this.state.isAddProductModalOpen}
            onModalClose={this.onAddProductModalClose}
          />
        )}

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
