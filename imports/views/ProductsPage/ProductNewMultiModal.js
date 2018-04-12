import React from 'react';
import Modal from 'react-modal';

import ConfirmationModal from '../components/ConfirmationModal';

export default class ProductNewMultiModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  onModalClose : function to execute on modal close
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isConfirmationModalOpen: false
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onConfirmationModalClose = this.onConfirmationModalClose.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
  }

  onInputChange(e) {
    if (e.target.id === 'productsJSON') {
      if (e.target.value === '') {
        const message = document.getElementById('message');
        message.textContent = '입력된 내용이 없습니다.';
        message.classList.add('error');
        this.refs.productsJSON.classList.add('error');
      } else {
        const message = document.getElementById('message');
        message.textContent =
          '등록하고자 하는 업체 리스트를 JSON 형태로 입력합니다.';
        message.classList.remove('error');
        this.refs.productsJSON.classList.remove('error');
      }
    }
  }

  onClickOK(e) {
    if (this.refs.productsJSON.value === '') {
      const message = document.getElementById('message');
      message.textContent = '입력된 내용이 없습니다.';
      message.classList.add('error');
      this.refs.productsJSON.classList.add('error');
    } else {
      const message = document.getElementById('message');
      message.textContent =
        '등록하고자 하는 품목 리스트를 JSON 형태로 입력합니다.';
      message.classList.remove('error');
      this.refs.productsJSON.classList.remove('error');
      this.setState({ isConfirmationModalOpen: true });
    }
  }

  onConfirmationModalClose(answer) {
    this.setState({ isConfirmationModalOpen: false });
    if (answer) {
      const json = JSON.parse(this.refs.productsJSON.value);
      Meteor.call('products.insertmany', json, (err, res) => {
        if (!err) {
          this.props.onModalClose();
        }
      });
    }
  }

  onClickCancel(e) {
    this.props.onModalClose();
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onModalClose}
        ariaHideApp={false}
        className="boxed-view__box add-new-multi-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h1>품목 대량등록</h1>
        </div>
        <div className="boxed-view__content">
          <textarea
            className="add-new-multi-modal__textarea"
            id="productsJSON"
            ref="productsJSON"
            name="productsJSON"
            onChange={this.onInputChange}
          />
          <p id="message" className="add-new-multi-modal__message">
            등록하고자 하는 품목 리스트를 JSON 형태로 입력합니다.
          </p>
          <div className="add-new-multi-modal__button-group">
            <button className="button" onClick={this.onClickOK}>
              등록
            </button>
            <button
              className="button button-cancel"
              onClick={this.onClickCancel}
            >
              취소
            </button>
          </div>
        </div>

        {this.state.isConfirmationModalOpen ? (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title="품목 대량등록"
            description="계속 하시겠습니까?"
            onModalClose={this.onConfirmationModalClose}
          />
        ) : (
          undefined
        )}
      </Modal>
    );
  }
}