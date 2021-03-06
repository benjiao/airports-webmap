import React, { Component } from 'react';
import DeckGL, { ScatterplotLayer, ArcLayer } from 'deck.gl';
import { StaticMap } from 'react-map-gl';
import axios from 'axios';
import './App.css';
import { MetricChanger } from '../components/MetricChanger'
import { AirportList } from '../components/AirportList'
import { AirportViewCard } from '../components/AirportViewCard'
import { FilterSlider } from '../components/FilterSlider'
import { OpacitySlider } from '../components/OpacitySlider'
import { IMPORTANCE_METRIC_OPTIONS } from '../containers/Constants'

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

  constructor(props) {
    super(props);

    this.state = {
      name: null,
      airports: {},
      sortedAirports: [],
      selectedRouteType: 'inbound',
      selectedAirport: null,
      selectedImportanceMetric: 0,
      radiusMultiplier: 1,
      percentDisplayed: 100,
      arcOpacity: 1
    };

    this.onHoverAirport = this.onHoverAirport.bind(this);
    this.onSelectAirport = this.onSelectAirport.bind(this);
    this.onSelectAirportFromList = this.onSelectAirportFromList.bind(this);
    this.onChangeImportanceMetric = this.onChangeImportanceMetric.bind(this);

    this.changePercentDisplayed = this.changePercentDisplayed.bind(this)
    this.changeArcOpacity = this.changeArcOpacity.bind(this)

    this.renderTooltip = this.renderTooltip.bind(this);
    this.fetchData = this.fetchData.bind(this);

    this.getLayers = this.getLayers.bind(this);
  }

  render() {
    
    const self = this;
    const {sortedAirports, selectedAirport, selectedImportanceMetric} = this.state;

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

          <MetricChanger 
            onChangeImportanceMetric={self.onChangeImportanceMetric}
            onSelectAirport={self.onSelectAirportFromList} 
            defaultImportanceMetric={0}
            selectedImportanceMetric={selectedImportanceMetric}
            />

          <AirportList 
            onChangeImportanceMetric={self.onChangeImportanceMetric}
            onSelectAirport={self.onSelectAirportFromList} 
            defaultImportanceMetric={0}
            airportList={sortedAirports}
            selectedImportanceMetric={selectedImportanceMetric}
            selectedAirport={selectedAirport}
            />

          <FilterSlider
            onChangeDisplayedPercentage={self.changePercentDisplayed} />

          <OpacitySlider
            onChange={self.changeArcOpacity} />
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
      return this.state.airports[this.state.selectedAirport]
    } else {
      return null;
    }
  }

  changeArcOpacity(value) {
    this.setState({
      arcOpacity: value
    })
  }

  changePercentDisplayed(value) {
    this.setState({
      percentDisplayed: value
    })
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

  onSelectAirportFromList(event, data) {
    if (this.state.selectedAirport === data.value) {
      this.setState({
        selectedAirport: null
      })
    } else {
      this.setState({
        selectedAirport: data.value
      });
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

  onHoverAirport({x, y, object}) {
    this.setState({x: x, y: y, hoveredAirport: object});
  }

  renderTooltip() {
    const {x, y, hoveredAirport, sortedAirports, selectedImportanceMetric} = this.state;

    if (!hoveredAirport) return null;

    var rank = sortedAirports.findIndex(x => x.id === hoveredAirport.id)

    return (
      <div className="tooltip" style={{left: x, top: y}}>
        <div className="tooltip-title">{ hoveredAirport.name }</div>
        <div className="tooltip-country">{ hoveredAirport.city }, { hoveredAirport.country }</div>
        <div className="tooltip-rank">Rank: { rank + 1 } </div>
        <div className="tooltip-importance">{IMPORTANCE_METRIC_OPTIONS[selectedImportanceMetric]['text']}: { hoveredAirport[IMPORTANCE_METRIC_OPTIONS[selectedImportanceMetric]['value']].toFixed(5) }</div>
      </div>
    );
  }

  getArcs() {
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
    var {sortedAirports, percentDisplayed, arcOpacity} = this.state

    return [
      new ScatterplotLayer({
        id: 'scatterplot-layer',
        data: sortedAirports.slice(0, Math.floor(sortedAirports.length * (percentDisplayed / 100))),
        pickable: true,
        radiusScale: 6,
        radiusMinPixels: 1,
        radiusMaxPixels: 100,
        onClick: this.onSelectAirport,
        onHover: this.onHoverAirport,
        getPosition: d => d.location,
        getRadius: d => this._getCircleRadius(d),
        getColor: d => this._getColor(d)
      }),
      new ArcLayer({
        id: 'arc',
        data: this.getArcs(),
        opacity: arcOpacity,
        getStrokeWidth: 1,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.destination,
        getSourceColor: d => [255, 255, 140],
        getTargetColor: d => [255, 140, 0]
      }),

      // new TextLayer({
      //   id: 'text-layer',
      //   data: this.state.sortedAirports.slice(0, 20),
      //   pickable: true,
      //   getPosition: d => d.location,
      //   getText: d => "#1",
      //   getColor: [255, 255, 255],
      //   getSize: 32,
      //   getAngle: 0,
      //   getTextAnchor: 'middle',
      //   getAlignmentBaseline: 'center',
      // }), 
    ]
  }

  _getColor(d) {
    var maxValue = this.state.sortedAirports[0][IMPORTANCE_METRIC_OPTIONS[this.state.selectedImportanceMetric].value]
    return [255, 255 - (255 * d[IMPORTANCE_METRIC_OPTIONS[this.state.selectedImportanceMetric].value] / maxValue), 0];
  }

  _getCircleRadius(d) {
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
