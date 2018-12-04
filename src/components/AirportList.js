import React, { Component } from 'react';
import { Segment, Header, List, Dropdown } from 'semantic-ui-react';

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
  constructor(props) {
    super(props);
  }

  render () {
    const self = this;

    return (
      <Segment.Group>
        <Segment>
          <Header as="h3">Top Airports</Header>
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
        <Segment className="topAirportList">
          <List divided relaxed>
            {self.props.airportList.slice(0, 20).map(function(row, index){
              return (
                <List.Item key={index}>
                  <List.Content>
                    <List.Header>{row.name}</List.Header>
                      {row[IMPORTANCE_METRIC_OPTIONS[self.props.selectedImportanceMetric]['value']]}
                  </List.Content>
                </List.Item>
              );
            })}
          </List>
        </Segment>
      </Segment.Group>)
  }
}
