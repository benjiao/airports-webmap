import React, { Component } from 'react';
import { Segment, Header, Dropdown } from 'semantic-ui-react';

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

export class MetricChanger extends Component {
  render () {
    const self = this;

    return (
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
        </Segment>)
  }
}
