import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import axios from 'axios';

const WIKIPEDIA_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/'

export class AirportViewCard extends Component {
  constructor(props) {
    super(props);

   this.state = {
      airportSummary: ""
    };
  }

  render () {
    const self = this;
    const {airport} = this.props
    console.log(airport)

    if (airport) {
      return (<Card>
        <Card.Content>
          <Card.Description dangerouslySetInnerHTML={{__html: self.state.airportSummary}}>
          </Card.Description>
        </Card.Content>
      </Card>)
    } else {
      return <div></div>
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.airport != this.props.airport) {
      const self = this;
      if (self.props.airport) {
        axios.get(WIKIPEDIA_URL + encodeURIComponent(this.props.airport.name))
        .then(function(res){
          console.log(res.data.extract_html);
          self.setState({
            airportSummary: res.data.extract_html
          })
        }).catch(function(err){
            self.setState({
              airportSummary: "<b>" + self.props.airport.name + "</b>"
            })  
        })
      }
    }
  }
  fetchAirportTrivia() {
  }

}
