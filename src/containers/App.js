import React, { Component } from 'react';
import DeckGL, { ScatterplotLayer, ArcLayer } from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import { Grid } from 'semantic-ui-react';
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
      airport_lookups: [],
      routes: {},
      selectedAirport: 79130,
      showRoutes: true,
      layers: []
    };

    this._onSelectCounty = this._onSelectCounty.bind(this);
  }

  render() {
    
    return (
      <Grid celled className="mainGrid">
        <Grid.Row>
          <Grid.Column width={2}>
            <a onClick={this.handleKeyPress}>Toggle Routes</a><br />
            <a onClick={this.handleKeyPress}>Eigenvector Centrality</a><br />
            <a onClick={this.handleKeyPress}>Degree</a><br />
            <a onClick={this.handleKeyPress}>Connectivity</a><br />
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

  _onSelectCounty({object}) {
    this.setState({
      selectedAirport: object.id
    });

    this._refreshLayers();
  }

  handleKeyPress(e) {
    e.preventDefault()
    console.log('HERE!')
  }

  _refreshLayers() {
    var data = this.state.airports;

    var layers = []
    var arc_data = this.state.routes[this.state.selectedAirport];
    console.log(arc_data);

    var arc_layer = new ArcLayer({
      id: 'arc',
      data: arc_data,
      getStrokeWidth: 1,
      getSourcePosition: d => d.source,
      getTargetPosition: d => d.destination,
      getSourceColor: d => [255, 255, 140],
      getTargetColor: d => [255, 140, 0],
      // onHover: ({object}) => setTooltip(`${object.from.name} to ${object.to.name}`)
    });
    layers.push(arc_layer)

    var airport_layer = new ScatterplotLayer({
      id: 'scatterplot-layer',
      data,
      pickable: true,
      opacity: 0.8,
      radiusScale: 6,
      radiusMinPixels: 1,
      radiusMaxPixels: 100,
      getPosition: d => d.location,
      getRadius: d => 1000 + (d.pagerank * 30000) ** 2,
      getColor: d => [255, 140, 0],
      onClick: this._onSelectCounty,
      // onHover: ({object}) => setTooltip(`${object.name}`)
    });

    layers.push(airport_layer)

    this.setState({
      layers: layers
    })
  }

  _initializeData() {
    var self = this;

    axios.get(DATA_URL)
      .then(function(res){

        // Update airports
        var airports = res.data.data;
        self.setState({
          airports: airports
        })

        // Create key value pairs for airports
        var airport_lookups = {};

        self.state.airports.forEach(function(airport){
          airport_lookups[airport.id] = airport;
        });
          
        self.setState({
          airport_lookups: airport_lookups
        });


        // Create route list
        var routes = {};
        self.state.airports.forEach(function(airport){
          var airport_routes = [];

          airport.destinations.forEach(function(destination){
            if (self.state.airport_lookups[destination]) {
              airport_routes.push({
                source: airport.location,
                destination: self.state.airport_lookups[destination].location
              });
            }    
          });

          routes[airport.id] = airport_routes;
        });

        self.setState({
          routes: routes
        });
          
        self._refreshLayers();
      })
  }

  componentDidMount() {
    this._initializeData();
  }

}

export default App;
