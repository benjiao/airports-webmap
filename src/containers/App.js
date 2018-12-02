import React, { Component } from 'react';
import DeckGL, { ScatterplotLayer, ArcLayer } from 'deck.gl';
import { StaticMap } from 'react-map-gl';
import { Segment, Header, List, Dropdown } from 'semantic-ui-react';
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


const IMPORTANCE_METRIC_OPTIONS = [
  {
    'value': 'degree',
    'text': 'Degree Centrality',
    'radius_offset': 25000
  },
  {
    'value': 'pagerank',
    'text': 'Pagerank',
    'radius_offset': 200000
  },
  {
    'value': 'evcent',
    'text': 'Eigenvector Centrality',
    'radius_offset': 35000
  },
]


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
      selectedImportanceScore: 0,
      radiusMultiplier: 1,
    };

    this._onHoverAirport = this._onHoverAirport.bind(this);
    this._onSelectAirport = this._onSelectAirport.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    this._refreshLayers = this._refreshLayers.bind(this);
    this.handleRouteTypeClick = this.handleRouteTypeClick.bind(this)
    this.handleImportanceScoreClick = this.handleImportanceScoreClick.bind(this)
    this.sortByImportance = this.sortByImportance.bind(this)
    this.onChangeImportanceMetric = this.onChangeImportanceMetric.bind(this)
  }

  render() {
    
    const self = this;

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

        <div className="mainPanel">
          <Segment.Group>
            <Segment>
              <Header as="h3">Top Airports</Header>
               <span>
                by{' '}
                <Dropdown
                  inline
                  options={IMPORTANCE_METRIC_OPTIONS}
                  defaultValue= {IMPORTANCE_METRIC_OPTIONS[0]['value']}
                  name='selectedImportanceMetric'
                  onChange={this.onChangeImportanceMetric}/>
              </span>
            </Segment>
            <Segment className="topAirportList">
              <List divided relaxed>
                {this.state.airports.slice(0, 20).map(function(row, index){
                  return (
                    <List.Item>
                      <List.Content>
                        <List.Header>{row.name}</List.Header>
                        {row[IMPORTANCE_METRIC_OPTIONS[self.state.selectedImportanceScore]['value']]}
                      </List.Content>
                    </List.Item>
                  );
                })}
              </List>
            </Segment>
          </Segment.Group>
        </div>
      </div>
    )
  }

  componentDidUpdate(prevProps) {
    var self = this;
  }

  onChangeImportanceMetric(event, data){
    var self = this;

    console.log("Change metric to: ", data.value)
    let selectedMetric = IMPORTANCE_METRIC_OPTIONS.findIndex(x => x.value === data.value)

    this.setState({
      selectedImportanceScore: selectedMetric
    });

    var airports = self.state.airports;
    self.setState({
      airports: airports.sort(self.sortByImportance(selectedMetric))
    })
  }

  sortByImportance(property) {
    return function(a, b){
      var importanceMetric = IMPORTANCE_METRIC_OPTIONS[property]['value']
      if (a[importanceMetric] < b[importanceMetric])
        return 1;
      if (a[importanceMetric] > b[importanceMetric])
        return -1;
      return 0;

    }
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
        <div className="tooltip-stat">{IMPORTANCE_METRIC_OPTIONS[this.state.selectedImportanceScore]['text']}: { hoveredAirport[IMPORTANCE_METRIC_OPTIONS[this.state.selectedImportanceScore]['value']] }</div>
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
    return d[IMPORTANCE_METRIC_OPTIONS[this.state.selectedImportanceScore]['value']]
  }

  _getCircleRadius(d, radiusMultiplier) {
    var radius = Math.sqrt(this._getImportanceScore(d))  * IMPORTANCE_METRIC_OPTIONS[this.state.selectedImportanceScore]['radius_offset'];
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
          airports: airports.sort(self.sortByImportance(0))
        })

        console.log(self.state.airports.slice(0, 20))

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
