import React, { Component } from 'react';
import { Segment, Header } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range'


export class FilterSlider extends Component {

  render () {
    const settings = {
      start: 100,
      min: 1,
      max: 100,
      step: 1,
      onChange: this.props.onChangeDisplayedPercentage
    }

    return (<Segment>
      <Header as="h4">Show More/Less Points</Header>
      <Slider
        discrete color="red"
        inverted={false}
        settings={settings}/>
    </Segment>)

  }
}
