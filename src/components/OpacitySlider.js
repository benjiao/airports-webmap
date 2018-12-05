import React, { Component } from 'react';
import { Segment, Header } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range'
import axios from 'axios';


export class OpacitySlider extends Component {
  render () {
    const self = this;

    const settings = {
      start: 0.5,
      min: 0,
      max: 0.5,
      step: 0.01,
      onChange: this.props.onChange
    }

    return (<Segment>
      <Header as="h4">Arc Opacity</Header>
      <Slider
        discrete color="red"
        inverted={false}
        settings={settings}/>
    </Segment>)

  }
}
