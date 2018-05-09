import React from 'react';

export default () => (
  <div className="spinner-container">
    <div className="spinner">
      <div className="bounce1"></div>
      <div className="bounce2"></div>
      <div className="bounce3"></div>
    </div>
    <div className="spinner-message">
      <span>데이터 가져오는 중</span>
    </div>
  </div>
);
