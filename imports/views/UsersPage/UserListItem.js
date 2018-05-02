import React from 'react';

export default class UserListItem extends React.Component {
  /*=========================================================================
  >> props <<
  user
  showUserModal
  showDeleteConfirmationModal
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.onPasswordResetClick = this.onPasswordResetClick.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  onPasswordResetClick(e) {
    const selectedUserID = this.getUserID(e.target);
    this.props.showUserModal(selectedUserID, 'password');
  }

  onEditClick(e) {
    const selectedUserID = this.getUserID(e.target);
    this.props.showUserModal(selectedUserID, 'profile');
  }

  onDeleteClick(e) {
    const selectedUserID = this.getUserID(e.target);
    this.props.showDeleteConfirmationModal(selectedUserID);
  }

  getUserID(target) {
    if (target.tagName === 'SPAN') {
      return target.parentNode.parentNode.parentNode.id;
    } else if (target.tagName === 'BUTTON') {
      return target.parentNode.parentNode.id;
    }
  }

  render() {
    const user = this.props.user;
    const isCurrentUser = Meteor.userId() === user._id;
    let listClassName = "user";

    let userRole = '사용자';
    if (user.profile.isManager) {
      userRole = '관리자';
    } else if (user.profile.isAdmin) {
      userRole = '최종관리자';
    }

    if (isCurrentUser) listClassName += " current-user"

    return (
      <li className={listClassName} key={user._id} id={user._id}>
        <div className="user-list-item__user-detail-container">
          <span>
            {user.profile.displayName}
            {isCurrentUser && <i className="fa fa-user-circle its-me"></i>}
          </span>
          <span>{user.profile.department}</span>
          <span>{user.profile.position}</span>
          <span>{userRole}</span>
        </div>

        <div className="user-list-item__buttons-container">
          <button
            className="button button-with-icon-span user-list-item__button"
            onClick={this.onPasswordResetClick}
          >
            <i className="fa fa-key fa-lg" />
            <span>비밀번호변경</span>
          </button>
          <button
            className="button button-with-icon-span user-list-item__button"
            onClick={this.onEditClick}
          >
            <i className="fa fa-edit fa-lg" />
            <span>수정</span>
          </button>
          <button
            className="button button-with-icon-span user-list-item__button"
            onClick={this.onDeleteClick}
            disabled={isCurrentUser}
          >
            <i className="fa fa-user-times fa-lg" />
            <span>삭제</span>
          </button>
        </div>
      </li>
    );
  }
}
