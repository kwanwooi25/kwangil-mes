import React from "react";
import Modal from "react-modal";

import ConfirmationModal from "../components/ConfirmationModal";

export default class AccountNewMultiModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen       : if modal is open
  onModalClose : function to execute on modal close
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isConfirmationModalOpen: false,
      json: [],
      error: ''
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onClickOK = this.onClickOK.bind(this);
    this.onConfirmationModalClose = this.onConfirmationModalClose.bind(this);
  }

  onInputChange(e) {
    if (e.target.files.length > 0 && e.target.files[0].type === 'application/json') {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const json = JSON.parse(reader.result);
        this.setState({ json, error: '' });
      };
      reader.readAsText(file);
    } else {
      e.target.value = '';
      this.setState({
        json: [],
        error: '파일타입 에러! JSON 파일만 가능합니다.'
      });
    }
  }

  onClickOK(e) {
    if (this.state.json.length === 0) {
      this.setState({ error: '선택된 파일이 없습니다.' });
    } else {
      this.setState({ isConfirmationModalOpen: true, error: '' });
    }
  }

  onConfirmationModalClose(answer) {
    this.setState({ isConfirmationModalOpen: false });
    if (answer) {
      Meteor.call("accounts.insertmany", this.state.json, (err, res) => {
        if (!err) {
          this.props.onModalClose();
        }
      });
    }
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
          <h1>거래처 대량등록</h1>
        </div>
        <div className="boxed-view__content">
          <input
            className="input"
            ref="json"
            type="file"
            accept=".json"
            onChange={this.onInputChange}
          />

          {this.state.error && (
            <p className="product-modal__error">{this.state.error}</p>
          )}

          <div className="button-group">
            <button className="button" onClick={this.onClickOK}>
              등록
            </button>
            <button
              className="button button-cancel"
              onClick={() => { this.props.onModalClose() }}
            >
              취소
            </button>
          </div>
        </div>

        {this.state.isConfirmationModalOpen && (
          <ConfirmationModal
            isOpen={this.state.isConfirmationModalOpen}
            title="거래처 대량등록"
            descriptionArray={["계속 하시겠습니까?"]}
            onModalClose={this.onConfirmationModalClose}
          />
        )}
      </Modal>
    );
  }
}
