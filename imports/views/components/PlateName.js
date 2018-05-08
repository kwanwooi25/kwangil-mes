import React from 'react';

import PlateDetailView from '../PlatesPage/PlateDetailView';

export default class PlateName extends React.Component {
  /*=========================================================================
  >> props <<
  className
  plateID
  plateRound
  plateLength
  queryRound
  queryLength
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
    const queryRound = this.props.queryRound;
    const queryLength = this.props.queryLength;
    let plateRound = this.props.plateRound;
    let plateLength = this.props.plateLength;
    let plateSize = '';

    if (queryRound && plateRound.toLowerCase().indexOf(queryRound) > -1) {
      const index = plateRound.toLowerCase().indexOf(queryRound);
      const matchingText = plateRound.substring(
        index,
        index + queryRound.length
      );
      plateRound = plateRound.replace(
        matchingText,
        `<span class="highlight">${matchingText}</span>`
      );
    }

    if (queryLength && plateLength.toLowerCase().indexOf(queryLength) > -1) {
      const index = plateLength.toLowerCase().indexOf(queryLength);
      const matchingText = plateLength.substring(
        index,
        index + queryLength.length
      );
      plateLength = plateLength.replace(
        matchingText,
        `<span class="highlight">${matchingText}</span>`
      );
    }

    plateSize = `${plateRound} x ${plateLength}`;

    return (
      <div className={this.props.className + '-container'}>
        <a
          className={'link ' + this.props.className}
          onClick={this.onClick}
          dangerouslySetInnerHTML={{ __html: plateSize }}
        />

        {this.state.isDetailViewOpen && (
          <PlateDetailView
            isOpen={this.state.isDetailViewOpen}
            plateID={this.state.plateID}
            onModalClose={this.onModalClose}
          />
        )}
      </div>
    );
  }
}
