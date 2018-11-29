import React, { Component } from 'react';
import DeckGL, { ScatterplotLayer, ArcLayer } from 'deck.gl';
import { StaticMap } from 'react-map-gl';
import { Slider } from 'react-semantic-ui-range'
import { Menu, Segment, Header } from 'semantic-ui-react';
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

// Multipliers for visualization
const RADIUS_OFFSETS = {
  'degree': 25000,
  'pagerank': 200000,
  'evcent': 35000
}


class App extends Component {

  constructor() {
    super();

    this.state = {
      name: null,
      airports: [],
      airport_lookups: [],
      outbound_routes: {},
      inbound_routes: {},
      selectedAirport: 79130,
      hoveredAirport: null,
      showRoutes: true,
      layers: [],

      selectedRouteType: 'inbound',
      selectedImportanceScore: 'evcent',
      radiusMultiplier: 1,
    };

    this._onHoverAirport = this._onHoverAirport.bind(this);
    this._onSelectAirport = this._onSelectAirport.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    this._refreshLayers = this._refreshLayers.bind(this);
    this.handleRouteTypeClick = this.handleRouteTypeClick.bind(this)
    this.handleImportanceScoreClick = this.handleImportanceScoreClick.bind(this)
  }

  render() {
    
    return (
      <div>
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
          {this._renderTooltip}
        </DeckGL>

        <div className="controlPanel">
          <Menu vertical>
            <Menu.Item>
              <Menu.Header>Route Type</Menu.Header>

              <Menu.Menu>

                <Menu.Item
                  name="inbound"
                  active={this.state.selectedRouteType === 'inbound'}
                  onClick={this.handleRouteTypeClick}>
                  Inbound
                </Menu.Item>

                <Menu.Item
                  name="outbound"
                  active={this.state.selectedRouteType === 'outbound'}
                  onClick={this.handleRouteTypeClick}>
                  Outbound
                </Menu.Item>
              </Menu.Menu>
            </Menu.Item>

            <Menu.Item>
              <Menu.Header>Importance Score</Menu.Header>
              <Menu.Menu>
                <Menu.Item
                  name="degree"
                  active={this.state.selectedImportanceScore === 'degree'}
                  onClick={this.handleImportanceScoreClick}>
                  Degree Centrality
                </Menu.Item>
                <Menu.Item
                  name="pagerank"
                  active={this.state.selectedImportanceScore === 'pagerank'}
                  onClick={this.handleImportanceScoreClick}>
                  Pagerank
                </Menu.Item>
                <Menu.Item
                  name="evcent"
                  active={this.state.selectedImportanceScore === 'evcent'}
                  onClick={this.handleImportanceScoreClick}>
                  Eigenvector Centrality
                </Menu.Item>
              </Menu.Menu>
            </Menu.Item>

            <Menu.Item>
              <Menu.Header>Circle Scale</Menu.Header>
              <Slider color="red" inverted={false} settings={{
                start: this.state.radiusMultiplier,
                min: 1,
                max: 100,
                step:0.25,
                onChange: (value) => {
                  this.setState({ radiusMultiplier: value });
                  this._refreshLayers();
                },
              }}/>
            </Menu.Item>
          </Menu>
        </div>

        <div className="airportListpanel">
          <Segment>
            <Header as="h3">Top Airports by Eigenvector Centrality</Header>
            <Header as="h3">Top Airports by Eigenvector Centrality</Header>
          </Segment>
        </div>
      </div>
    )
  }

  handleRouteTypeClick(e, {name}){

    this.setState({
      selectedRouteType: name
    })
    this._refreshLayers()
  }

  handleImportanceScoreClick(e, {name}) {
    this.setState({
      selectedImportanceScore: name
    })

    this._refreshLayers()
  }

  _onHoverAirport({x, y, object}) {
    this.setState({x: x, y: y, hoveredAirport: object});
  }

  _renderTooltip() {
    const {x, y, hoveredAirport} = this.state;

    if (!hoveredAirport) return null;

    return (
      <div className="tooltip" style={{left: x, top: y}}>
        <div className="tooltip-title">{ hoveredAirport.name }</div>
        <div className="tooltip-country">{ hoveredAirport.city }, { hoveredAirport.country }</div><hr />
        <div className="tooltip-stat">{this.state.selectedImportanceScore}: { hoveredAirport[this.state.selectedImportanceScore] }</div>
      </div>
    );
  }

  _onSelectAirport({object}) {

    if (this.state.selectedAirport === object.id) {
      this.setState({
        selectedAirport: null
      })
    } else {
      this.setState({
        selectedAirport: object.id
      });
    }
    this._refreshLayers();
  }

  handleKeyPress(e) {
    e.preventDefault()
  }

  _getImportanceScore(d) {
    return d[this.state.selectedImportanceScore]
  }

  _getCircleRadius(d, radiusMultiplier) {
    var radius = Math.sqrt(this._getImportanceScore(d))  * RADIUS_OFFSETS[this.state.selectedImportanceScore];
    return radius

  }

  _refreshLayers() {
    var data = this.state.airports;
    var layers = []

    var arc_data = [];
    if (this.state.selectedRouteType === 'inbound') {
      arc_data = this.state.inbound_routes[this.state.selectedAirport];
    } else if (this.state.selectedRouteType === 'outbound') {
      arc_data = this.state.outbound_routes[this.state.selectedAirport];
    }

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
      onClick: this._onSelectAirport,
      onHover: this._onHoverAirport,
      getPosition: d => d.location,
      getRadius: d => this._getCircleRadius(d, this.state.radiusMultiplier),
      getColor: d => [255, 140, 0],
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
        var inbound_routes = {}
        var outbound_routes = {};

        self.state.airports.forEach(function(airport){
          var airport_inbound = [];
          var airport_outbound = [];

          airport.sources.forEach(function(source){
            if (self.state.airport_lookups[source]) {
              airport_inbound.push({
                source: self.state.airport_lookups[source].location,
                destination: airport.location,
              });
            }    
          });

          airport.destinations.forEach(function(destination){
            if (self.state.airport_lookups[destination]) {
              airport_outbound.push({
                source: airport.location,
                destination: self.state.airport_lookups[destination].location
              });
            }    
          });

          inbound_routes[airport.id] = airport_inbound;
          outbound_routes[airport.id] = airport_outbound;
        });

        self.setState({
          inbound_routes: inbound_routes,
          outbound_routes: outbound_routes
        });
          
        self._refreshLayers();
      })
  }

  componentDidMount() {
    this._initializeData();
  }
}

export default App;
