import React, { Component } from 'react';
import { Card, Segment } from 'semantic-ui-react';
import { IMPORTANCE_METRIC_OPTIONS } from '../containers/Constants'

export class AirportList extends Component {
  render () {
    const self = this;

    return (
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
                <Card.Description>Score: { row[IMPORTANCE_METRIC_OPTIONS[self.props.selectedImportanceMetric]['value']] }</Card.Description>
              </Card.Content>

            </Card>
          );
        })}
      </Segment>)
  }
}
