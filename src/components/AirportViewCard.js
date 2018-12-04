import React, { Component } from 'react';
import { Card, Image } from 'semantic-ui-react';
import axios from 'axios';

const WIKIPEDIA_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/'

export class AirportViewCard extends Component {
  constructor(props) {
    super(props);

   this.state = {
      airportSummary: "",
      airportThumbnail: ""
    };
  }

  render () {
    const self = this;
    const {airport} = this.props
    console.log(airport)

    if (airport) {
      return (<Card>
        <Image src={ self.state.airportThumbnail } />
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
          console.log(res.data);
          self.setState({
            airportSummary: res.data.extract_html,
            airportThumbnail: res.data.thumbnail.source
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
