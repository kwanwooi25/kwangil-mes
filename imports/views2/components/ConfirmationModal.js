import React from "react";
import Modal from "react-modal";

export default class ConfirmationModal extends React.Component {
  /*=========================================================================
  >> props <<
  isOpen            : if modal is open
  title             : modal title
  descriptionArray  : description on what the modal confirms for
  onModalClose      : function to execute on modal close
  ==========================================================================*/

  getDescription() {
    return this.props.descriptionArray.map((description, index) => {
      return (
        <p key={index} className="confirmation-modal__description">
          {description}
        </p>
      );
    });
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={() => {
          this.props.onModalClose(false);
        }}
        ariaHideApp={false}
        className="boxed-view__box confirmation-modal"
        overlayClassName="react-modal__bg"
      >
        <div className="boxed-view__header">
          <h2>{this.props.title}</h2>
        </div>
        <div className="boxed-view__content">
          {this.getDescription()}
          <div className="confirmation-modal__button-group">
            <button
              className="button"
              onClick={() => {
                this.props.onModalClose(true);
              }}
            >
              확인
            </button>
            <button
              className="button button-cancel"
              onClick={() => {
                this.props.onModalClose(false);
              }}
            >
              취소
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}
