import React from 'react';
import { Link } from 'react-router-dom';

export default () => (
  <div className="no-result not-found">
    <i className="fa fa-ban" />
    <p className="no-result-message">존재하지 않는 페이지입니다.</p>
    <Link
      to="/dashboard"
      className="go-home"
    >
      Go Home
    </Link>
  </div>
);
