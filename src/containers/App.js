import React, { Component } from 'react';
import { Container, Grid, Button } from 'semantic-ui-react';
import axios from 'axios';

import './App.css';

const DATA_URL = 'https://raw.githubusercontent.com/benjiao/airports-webmap/master/data/airports.json'


class App extends Component {

  constructor() {
    super();

    this.state = {
      name: null,
      airports: [],
      arcs: []
    };
  }

  render() {
    return (
      <Grid celled>
        <Grid.Row>
          <Grid.Column width={3}>
            <Button onClick={this.handleKeyPress}>Click Here</Button>
          </Grid.Column>
          <Grid.Column width={13}>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  handleKeyPress(e) {
    e.preventDefault()
    console.log('HERE!')
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
      })
  }

  componentDidMount() {
    this._initializeData();
  }

}

export default App;
