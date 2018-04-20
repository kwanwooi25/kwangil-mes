import React from 'react';
import Modal from 'react-modal';

import TextInput from '../../custom/TextInput';

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
      mode: 'ADDNEW',
      name: '',
      round: '',
      length: '',
      material: '',
      location: '',
      forProducts: [],  // [ productID, content ],
      history: [],      // [ date, memo ]
      nameEmpty: false,
      roundEmpty: false,
      roundError: false,
      lengthEmpty: false,
      lengthError: false,
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
          <div className="form-element-container">
            <div className="form-element__label">
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
          <div className="form-element-container">
            <div className="form-element__label">
              <label htmlFor="round">규격</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element"
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
              <i className="fa fa-times" />
              <TextInput
                className="form-element"
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
          <div className="form-element-container">
            <div className="form-element__label">
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
          <div className="form-element-container">
            <div className="form-element__label">
              <label htmlFor="material">구분</label>
            </div>
            <div className="form-elements">
              <select
                className="select"
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

          {/* <div className="form-element-container">
            <div className="form-element__label">
              <label htmlFor="phone_1">전화번호1</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element"
                inputType="text"
                id="phone_1"
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
            </div>
          </div>
          <div className="form-element-container">
            <div className="form-element__label">
              <label htmlFor="phone_2">전화번호2</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element"
                inputType="text"
                id="phone_2"
                value={this.state.phone_2}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.phone_2Error
                    ? '숫자만 입력 가능합니다.'
                    : undefined
                }
              />
            </div>
          </div>
          <div className="form-element-container">
            <div className="form-element__label">
              <label htmlFor="fax">팩스번호</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element"
                inputType="text"
                id="fax"
                value={this.state.fax}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.faxError ? '숫자만 입력 가능합니다.' : undefined
                }
              />
            </div>
          </div>
          <div className="form-element-container">
            <div className="form-element__label">
              <label htmlFor="email_1">이메일1</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element"
                inputType="email"
                id="email_1"
                value={this.state.email_1}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.email_1Error
                    ? '올바른 이메일 형식이 아닙니다.'
                    : undefined
                }
              />
            </div>
          </div>
          <div className="form-element-container">
            <div className="form-element__label">
              <label htmlFor="email_2">이메일2</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element"
                inputType="email"
                id="email_2"
                value={this.state.email_2}
                onInputChange={this.onInputChange}
                errorMessage={
                  this.state.email_2Error
                    ? '올바른 이메일 형식이 아닙니다.'
                    : undefined
                }
              />
            </div>
          </div>
          <div className="form-element-container">
            <div className="form-element__label">
              <label htmlFor="address">주소</label>
            </div>
            <div className="form-elements">
              <TextInput
                className="form-element"
                inputType="text"
                id="address"
                value={this.state.address}
                onInputChange={this.onInputChange}
              />
            </div>
          </div>
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
          </div> */}

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
        {/* {this.state.isConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title={this.state.confirmationTitle}
            descriptionArray={this.state.confirmationDescription}
            onModalClose={this.onConfirmationModalClose}
          />
        ) : (
          undefined
        )} */}
      </Modal>
    )
  }
}
