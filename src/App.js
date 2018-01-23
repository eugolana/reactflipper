import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const corner_radius = 5;

const board_width = 1000;
const board_height = 600;
const margin = 10;

const background_color = '#eeeecc'

function Tile(props) {
  return (
    <rect 
      x={props.x} 
      y={props.y} 
      width={props.width} 
      height={props.height} 
      rx={corner_radius}
      ry={corner_radius}
      fill={props.color} 
      id={"tile_" + props.id}
      />
  )
}


class Board extends Component {
  constructor(props) {
    super(props);
    this.height = props.height;
    this.width = props.width;
    let tile_width = ((this.width -  margin) / props.columns) - 10;
    let tile_height = ((this.height -  margin) / props.rows) - 10;
    this.state = {
      rows: props.rows,
      columns: props.columns,
      tile_width: tile_width,
      tile_height: tile_height,
      tile_margin: 10,
      tiles: Array(props.rows * props.columns).fill(null)
    }
  }

  render() {
    var tiles = [];

    for (var c = 0; c < this.state.columns; c++) {
      for (var r = 0; r < this.state.rows; r++) {
        tiles.push(
          <Tile 
          x={ 2 * margin + c * (this.state.tile_width + this.state.tile_margin) }
          y={ 2 * margin + r * (this.state.tile_height + this.state.tile_margin) }
          width={ this.state.tile_width }
          height={ this.state.tile_height }
          color='#ccccee'
          id={r * this.state.columns + c}
          />
        );
      }
    }
    // console.log(tiles)
    return (
      <div className="board">
        <svg id="boardSVG">
          <rect 
            x={margin} 
            y={margin} 
            width={board_width} 
            height={board_height} 
            fill={background_color} 
            rx={corner_radius} 
            ry={corner_radius}>
          </rect>
            {tiles}            
        </svg>
      </div>
    )
  }
}

class App extends Component {
  render() {
    return (
        <Board 
          rows="5"
          columns="10"
          height={board_height}
          width={board_width}
        />
    )
  }
}

export default App;
