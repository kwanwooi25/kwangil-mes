import React from 'react';

export default class UserListItem extends React.Component {
  /*=========================================================================
  >> props <<
  user
  showAccountDetailViewModal
  showEditAccountModal
  showDeleteConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    // this.onNameClick = this.onNameClick.bind(this);
    // this.onEditClick = this.onEditClick.bind(this);
    // this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  // // show detail view modal
  // onNameClick(e) {
  //   const selectedAccountID = e.target.parentNode.parentNode.parentNode.id;
  //
  //   this.props.showAccountDetailViewModal(selectedAccountID);
  // }
  //
  // // show account modal (EDIT mode)
  // onEditClick(e) {
  //   const selectedAccountID = this.getAccountID(e.target);
  //
  //   this.props.showEditAccountModal(selectedAccountID);
  // }
  //
  // // show confirmation modal before delete
  // onDeleteClick(e) {
  //   const selectedAccountID = this.getAccountID(e.target);
  //
  //   this.props.showDeleteConfirmationModal(selectedAccountID);
  // }
  //
  // getAccountID(target) {
  //   if (target.tagName === 'SPAN') {
  //     return target.parentNode.parentNode.parentNode.id;
  //   } else if (target.tagName === 'BUTTON') {
  //     return target.parentNode.parentNode.id;
  //   }
  // }

  render() {
    const user = this.props.user;
    let userRole = '사용자';
    if (user.profile.isManager) {
      userRole = '관리자';
    }

    return (
      <li className="user" key={user._id} id={user._id}>
        <div className="user-list-item__user-detail-container">
          <span>{user.profile.displayName}</span>
          <span>{user.profile.department}</span>
          <span>{user.profile.position}</span>
          <span>{userRole}</span>
        </div>

        <div className="user-list-item__buttons-container">
          <button
            className="button button-with-icon-span user-list-item__button"
            // onClick={this.onEditClick}
          >
            <i className="fa fa-edit fa-lg" />
            <span>수정</span>
          </button>
          <button
            className="button button-with-icon-span user-list-item__button"
            // onClick={this.onDeleteClick}
          >
            <i className="fa fa-trash fa-lg" />
            <span>삭제</span>
          </button>
        </div>
      </li>
    );
  }
}
