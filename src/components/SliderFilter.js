import React, { Component } from 'react';
import { Segment, Header } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range'
import axios from 'axios';


export class SliderFilter extends Component {
  constructor(props) {
    super(props);

   this.state = {
      airportSummary: "",
      airportThumbnail: "",
      wikiUrl: ""
    };
  }

  render () {
    const self = this;
    const {airport} = this.props

    const settings = {
      start: 100,
      min: 1,
      max: 100,
      step: 1,
      onChange: this.props.onChangeDisplayedPercentage
    }

    return (<Segment>
      <Header as="h4">Show More/Less</Header>
      <Slider
        discrete color="red"
        inverted={false}
        settings={settings}/>
    </Segment>)

  }
}
