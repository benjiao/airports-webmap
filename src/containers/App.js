import React, { Component } from 'react';
import DeckGL, { ScatterplotLayer, ArcLayer, TextLayer } from 'deck.gl';
import { StaticMap } from 'react-map-gl';
import axios from 'axios';
import './App.css';
import { AirportList } from '../components/AirportList'
import { AirportViewCard } from '../components/AirportViewCard'

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
    'radius_offset': 150000
  },
  {
    'value': 'evcent',
    'text': 'Eigenvector Centrality',
    'radius_offset': 30000
  },
]


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      name: null,
      airports: {},
      sortedAirports: [],
      selectedRouteType: 'inbound',
      selectedAirport: 79130,
      selectedImportanceMetric: 0,
      radiusMultiplier: 1,
    };

    this.onHoverAirport = this.onHoverAirport.bind(this);
    this.onSelectAirport = this.onSelectAirport.bind(this);
    this.onChangeImportanceMetric = this.onChangeImportanceMetric.bind(this);

    this.renderTooltip = this.renderTooltip.bind(this);
    this.fetchData = this.fetchData.bind(this);

    this.getLayers = this.getLayers.bind(this);
  }

  render() {
    
    const self = this;
    const {airports} = this.state;

    return (
      <div>
        <DeckGL
          layers={ this.getLayers() }
          initialViewState={viewState}
          controller={true}>
          {(
            <StaticMap
              reuseMaps
              mapStyle="mapbox://styles/mapbox/dark-v9"
              preventStyleDiffing={true}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              onContextMenu={event => event.preventDefault()}/>
          )}
          {this.renderTooltip}

        </DeckGL>

        <div className="mainPanel">
          <AirportList 
            onChangeImportanceMetric={self.onChangeImportanceMetric}
            defaultImportanceMetric={0}
            airportList={self.state.sortedAirports}
            selectedImportanceMetric={self.state.selectedImportanceMetric} />
        </div>
        <div className="rightPanel">
          <AirportViewCard 
            airport={self.getSelectedAirport()}/>
        </div>
      </div>
    )
  }

  getSelectedAirport(){
    if (this.state.selectedAirport) {
      console.log("HERE!")
      return this.state.airports[this.state.selectedAirport]
    } else {
      return null;
    }
  }

  onChangeImportanceMetric(event, data){
    var self = this;
    var {airports} = self.state

    let selectedImportanceMetric = IMPORTANCE_METRIC_OPTIONS.findIndex(x => x.value === data.value)
    var sortedAirports = Object.values(airports).sort(this.sortByImportance(selectedImportanceMetric));

    this.setState({
      selectedImportanceMetric: selectedImportanceMetric,
      sortedAirports: sortedAirports
    });
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

  onHoverAirport({x, y, object}) {
    this.setState({x: x, y: y, hoveredAirport: object});
  }

  renderTooltip() {
    const {x, y, hoveredAirport} = this.state;

    if (!hoveredAirport) return null;

    return (
      <div className="tooltip" style={{left: x, top: y}}>
        <div className="tooltip-title">{ hoveredAirport.name }</div>
        <div className="tooltip-country">{ hoveredAirport.city }, { hoveredAirport.country }</div>
      </div>
    );
  }

  onSelectAirport({object}) {

    if (this.state.selectedAirport === object.id) {
      this.setState({
        selectedAirport: null
      })
    } else {
      this.setState({
        selectedAirport: object.id
      });
    }
  }

  getArcs() {
    var self = this;
    var arcs = [];
    var {airports, selectedAirport, selectedRouteType} = this.state

    if (selectedRouteType === 'inbound' && airports[selectedAirport]) {
      airports[selectedAirport].sources.forEach(function(source){
        if (airports[source]) {
          arcs.push({
            source: airports[source].location,
            destination: airports[selectedAirport].location,
          });
        }    
      });

    } else if (selectedRouteType === 'outbound') {

    }

    return arcs;
  }

  getLayers() {

    return [
      new ScatterplotLayer({
        id: 'scatterplot-layer',
        data: Object.values(this.state.airports),
        pickable: true,
        opacity: 0.8,
        radiusScale: 6,
        radiusMinPixels: 1,
        radiusMaxPixels: 100,
        onClick: this.onSelectAirport,
        onHover: this.onHoverAirport,
        getPosition: d => d.location,
        getRadius: d => this._getCircleRadius(d, this.state.radiusMultiplier),
        getColor: d => this._getColor(d),
      }),
      new ArcLayer({
        id: 'arc',
        data: this.getArcs(),
        getStrokeWidth: 1,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.destination,
        getSourceColor: d => [255, 255, 140],
        getTargetColor: d => [255, 140, 0]
      }),

      new TextLayer({
        id: 'text-layer',
        data: this.state.sortedAirports.slice(0, 20),
        pickable: true,
        getPosition: d => d.location,
        getText: d => "#1",
        getColor: [255, 255, 255],
        getSize: 32,
        getAngle: 0,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
      }), 
    ]
  }

  _getColor(d) {
    var maxValue = this.state.sortedAirports[0][IMPORTANCE_METRIC_OPTIONS[this.state.selectedImportanceMetric].value]
    return [255, 255 - (255 * d[IMPORTANCE_METRIC_OPTIONS[this.state.selectedImportanceMetric].value] / maxValue), 0];
  }

  _getCircleRadius(d, radiusMultiplier) {
    var maxValue = this.state.sortedAirports[0][IMPORTANCE_METRIC_OPTIONS[this.state.selectedImportanceMetric].value]
    var rescaledValue = this._getImportanceScore(d) / maxValue
    var radius = Math.sqrt(rescaledValue) * 18000
    return radius;
  }

  fetchData() {
    var self = this;

    axios.get(DATA_URL)
      .then(function(res){

        // Update airports
        var airports = [];
        res.data.data.forEach(function(airport){
          airports[airport.id] = airport;
        });

        var sortedAirports = Object.values(airports).sort(self.sortByImportance(0));
        self.setState({
          airports: airports,
          sortedAirports: sortedAirports
        })
      })
  }

  componentDidMount() {
    this.fetchData();

    document.addEventListener('contextmenu', this._handleContextMenu);
  }
  _handleContextMenu(event) {
    event.preventDefault();
  }
  _getImportanceScore(d) {
    return d[IMPORTANCE_METRIC_OPTIONS[this.state.selectedImportanceMetric]['value']];
  }

}

export default App;
