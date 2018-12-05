import React, { Component } from 'react';
import { Card, Image, Icon } from 'semantic-ui-react';
import axios from 'axios';

const WIKIPEDIA_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/'


function WikipediaLink(props) {

  const link = props.link;
  if (link) {
    return (
      <p className="wikipediaLink">
        <a href={link}>View in Wikipedia > </a>
      </p>)
  }
  return null;
}

export class AirportViewCard extends Component {
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

    console.log(airport);

    if (airport) {
      return (<Card>
        <Image src={ self.state.airportThumbnail } />
        <Card.Content>
          <Card.Description dangerouslySetInnerHTML={{__html: self.state.airportSummary}}>
          </Card.Description>

          <WikipediaLink link={self.state.wikiUrl} />
        </Card.Content>
        <Card.Content extra>
          <a>
            <Icon name='plane' />
            {airport.sources.length} inbound, {airport.destinations.length} outbound
          </a>
        </Card.Content>

      </Card>)
    } else {
      return <div></div>
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.airport !== this.props.airport) {
      const self = this;
      if (self.props.airport) {
        axios.get(WIKIPEDIA_URL + encodeURIComponent(this.props.airport.name))
        .then(function(res){
          self.setState({
            airportSummary: res.data.extract_html,
            airportThumbnail: res.data.thumbnail.source,
            wikiUrl: res.data.content_urls.desktop.page
          })
        }).catch(function(err){
            self.setState({
              airportSummary: "<b>" + self.props.airport.name + "</b>",
              airportThumbnail: "",
              wikiUrl: ""
            })  
        })
      }
    }
  }
}
