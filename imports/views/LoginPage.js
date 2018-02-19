import React from 'react';

export default class LoginPage extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col s12 m9 l6">
          <div className="card white">
            <div className="card-content">
              <span className="card-title">광일MES 로그인</span>
              <form className="col s12">
                <div className="row">
                  <div className="input-field col s12">
                    <input className="validate" type="text" id="id" ref="id" />
                    <label htmlFor="id">아이디</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input
                      className="validate"
                      type="text"
                      id="password"
                      ref="password"
                    />
                    <label htmlFor="password">비밀번호</label>
                  </div>
                </div>
                <div className="row">
                  <div className="col s6">
                    <a className="waves-effect waves-light btn">로그인</a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
