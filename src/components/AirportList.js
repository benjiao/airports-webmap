import React, { Component } from 'react';
import { Label, Image, Card, Segment, Header, List, Dropdown } from 'semantic-ui-react';

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

export class AirportList extends Component {
  render () {
    const self = this;

    return (
      <Segment.Group>
        <Segment>
          <Header as="h2">Top Airports</Header>
           <span>
            by{' '}
            <Dropdown
              inline
              options={IMPORTANCE_METRIC_OPTIONS}
              defaultValue= {IMPORTANCE_METRIC_OPTIONS[self.props.selectedImportanceMetric]['value']}
              name='selectedImportanceMetric'
              onChange={this.props.onChangeImportanceMetric}/>
          </span>
        </Segment>
        <Segment secondary className="topAirportList">
          {self.props.airportList.slice(0, 20).map(function(row, index){
            console.log(row)
            return (
              <Card
                value={row.id}
                onClick={self.props.onSelectAirport}
                className={self.props.selectedAirport === row.id ? 'selected': ''}>

                <Card.Content>
                  <Card.Header>{row.name}</Card.Header>
                  <Card.Meta>Rank { index + 1 }</Card.Meta>
                  <Card.Description>Score: { row[IMPORTANCE_METRIC_OPTIONS[self.props.selectedImportanceMetric]['value']].toFixed(5) }</Card.Description>
                </Card.Content>

              </Card>
            );
          })}
        </Segment>

      </Segment.Group>)
  }
}
