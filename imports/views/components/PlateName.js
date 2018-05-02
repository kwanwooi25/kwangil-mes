import React from 'react';

import PlateDetailView from '../PlatesPage/PlateDetailView';

export default class PlateName extends React.Component {
  /*=========================================================================
  >> props <<
  className
  plateID
  plateName
  ==========================================================================*/
  constructor(props) {
    super(props);

    this.state = {
      isDetailViewOpen: false,
      plateID: props.plateID
    };

    this.onClick = this.onClick.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
  }

  onClick(e) {
    this.setState({ isDetailViewOpen: true });
  }

  onModalClose() {
    this.setState({ isDetailViewOpen: false });
  }

  render() {
    return (
      <div className={this.props.className + '-container'}>
        <a
          className={'link ' + this.props.className}
          onClick={this.onClick}
        >
          {this.props.plateName}
        </a>

        {this.state.isDetailViewOpen && (
          <PlateDetailView
            isOpen={this.state.isDetailViewOpen}
            plateID={this.state.plateID}
            onModalClose={this.onModalClose}
          />
        )}
      </div>
    )
  }
}
