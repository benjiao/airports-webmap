import React, { Component } from 'react';
import { Segment, Header, Dropdown } from 'semantic-ui-react';
import { IMPORTANCE_METRIC_OPTIONS } from '../containers/Constants'


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
