import React, { Component } from 'react';
import DeckGL, { ScatterplotLayer, IconLayer } from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import { Container, Grid, Button } from 'semantic-ui-react';
import axios from 'axios';
import './App.css';

// Viewport settings
const viewState = {
  longitude: 0,
  latitude: 12,
  zoom: 2,
  pitch: 20,
  bearing: 20
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmVuamlhbyIsImEiOiJjaWc4NXl0c3MwMGZ4dWhtNXBrc2V6YjhuIn0.8y1VtL2RJZ3wi8Aam6cG8Q';
const DATA_URL = 'https://raw.githubusercontent.com/benjiao/airports-webmap/master/data/airports.json'

class App extends Component {

  constructor() {
    super();

    this.state = {
      name: null,
      airports: [],
      arcs: [],
      layers: []
    };
  }

  render() {
    
    return (
      <Grid celled className="mainGrid">
        <Grid.Row>
          <Grid.Column width={2}>
            <Button onClick={this.handleKeyPress}>Click Here</Button>
          </Grid.Column>
          <Grid.Column width={14}>
            <DeckGL
              layers={ this.state.layers }
              initialViewState={viewState}
              controller={true}>
              {(
                <StaticMap
                  reuseMaps
                  mapStyle="mapbox://styles/mapbox/dark-v9"
                  preventStyleDiffing={true}
                  mapboxApiAccessToken={MAPBOX_TOKEN} />
              )}
            </DeckGL>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  handleKeyPress(e) {
    e.preventDefault()
    console.log('HERE!')
  }

  _refreshLayers() {
    var data = this.state.airports;
    var layers = new ScatterplotLayer({
      id: 'scatterplot-layer',
      data,
      pickable: true,
      opacity: 0.8,
      radiusScale: 6,
      radiusMinPixels: 1,
      radiusMaxPixels: 100,
      getPosition: d => d.location,
      getRadius: d => 1000 + (d.evcent * 800) ** 2,
      getColor: d => [255, 140, 0],
      // onHover: ({object}) => setTooltip(`${object.name}\n${object.address}`)
    });

    this.setState({
      layers: layers
    })
  }

  _initializeData() {
    var self = this;

    axios.get(DATA_URL)
      .then(function(res){
        var airports = res.data.data;
        console.log(airports);


        self.setState({
          airports: airports
        })

        self._refreshLayers();
      })
  }

  componentDidMount() {
    this._initializeData();
  }

}

export default App;
