import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const corner_radius = 4;

const tile_margin = 6;

const columns = 8;
const rows = 3;

const NUMBER_OF_PATTERNS = 4;

const margin = 10;
const board_width = window.innerWidth - 20;
const board_height = 600;

const background_color = '#842'
const tile_color = '#bbf'
const tile_highlight_color = '#88b'



function Tile(props){
  const MyShape = gameTiles[props.shape];
  return (
    <g 
    onMouseOver={props.onHover}
    onMouseLeave={props.onBlur}
    onClick={props.onClick}
    >
      <rect 
        x={props.x} 
        y={props.y} 
        width={props.width} 
        height={props.height} 
        rx={corner_radius}
        ry={corner_radius}
        fill={props.color} 
        id={"tile_" + props.id}
      >
      </rect>
      <MyShape     
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        opacity={props.active}
      />
    </g>  
  )
}

class Shape extends Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.state = {
      centerX: props.x + (props.tile_width / 2) + (props.offset_x? props.offset_x : 0),
      centerY: props.y + (props.tile_height / 2) +(props.offset_y? props.offset_y : 0),
      tile_width: props.tile_width,
      tile_height: props.tile_height,
      width: props.width ? props.width : props.tile_width * 0.6,
      height: props.height ? props.height : props.tile_height * 0.6,
      color: props.color? props.color : '#888888'
    };
  }
}

class Ellipse extends Shape {
  constructor(props) {
    super(props);
    this.state.rx = this.state.width / 2;
    this.state.ry = this.state.height / 2
  }
  render() {
    return (
      <ellipse 
        cx={this.state.centerX}
        cy={this.state.centerY}
        rx={this.state.rx}
        ry={this.state.ry}
        fill={this.state.color}
      />
    )
  }
}

class Circle extends Ellipse {
  constructor(props) {
    super(props);
     this.state.ry = this.state.rx = Math.min(this.state.rx, this.state.ry);
  }
}

class Rectangle extends Shape {
  constructor(props) {
    super(props);
    this.state.corner_radius = corner_radius;
  }
  render() {
    return (
      <rect
      x={this.state.centerX - (this.state.width/2)}
      y={this.state.centerY - (this.state.height/2)}
      width={this.state.width}
      height={this.state.height}
      fill={this.state.color}
      rx={this.state.corner_radius}
      ry={this.state.corner_radius}
      />
    )
  }
}

class Square extends Rectangle {
  constructor(props) {
    super(props);
    console.log('constructing Square')
    this.state.height = this.state.width = Math.min(this.state.width, this.state.height);
    
  }
}

class Board extends Component {
  constructor(props) {
    super(props);
    this.height = props.height;
    this.width = props.width;
    let tile_width = ((this.width -  margin) / props.columns) - tile_margin;
    let tile_height = ((this.height -  margin) / props.rows) - tile_margin;
    this.cell_count = props.rows * props.columns;
    console.log('cell count')
    let patterns = Array(this.cell_count / 2).fill(0).map(v => Math.floor(Math.random() * NUMBER_OF_PATTERNS));
    patterns = shuffle(patterns.concat(patterns));

    this.state = {
      cell_count: this.cell_count,
      rows: props.rows,
      columns: props.columns,
      tile_width: tile_width,
      tile_height: tile_height,
      tile_margin: tile_margin,
      tilePattern: patterns,
      tileActive: Array(this.cell_count).fill(0),
      tileHighlight: Array(this.cell_count).fill(0),
      tileSolved: Array(this.cell_count).fill(0)
    }
  }

  handleClick(id) {
    console.log('clickered ' + id)
    if (this.state.tileActive[id] || this.state.tileSolved[id]) {
      return;
    }
    const tileActive = this.state.tileActive.slice();
    switch (tileActive.filter(v => v>=1).length) {
      case 0:
        tileActive[id] = 1;
        this.setState({
          tileActive: tileActive
        });
        break;
      case 1:
        tileActive[id] = 1;
        this.setState({
          tileActive: tileActive
        });
        var active_patterns = this.state.tilePattern.filter((item,i) => tileActive[i]);
        if (active_patterns[0] == active_patterns[1]) {
          console.log('match!')
          const solved = this.state.tileSolved.map((item, i) => (item || tileActive[i]? 1 : 0));
          const newTileActive = Array(this.state.cell_count).fill(0);
          this.setState({
            tileSolved: solved,
            tileActive: newTileActive
          })

        } 
        break;
      case 2:
        let newtileActive = Array(this.state.cell_count).fill(0);
        newtileActive[id] = 1;

        this.setState({
          tileActive: newtileActive
        })
        break;
      default:
        return;
    }

  }

  handleHover(i) {
    const tileHighlight = this.state.tileHighlight.slice();
    tileHighlight[i] = true;
    this.setState({
      tileHighlight: tileHighlight
    })
  }

  handleBlur(i) {
    const tileHighlight = this.state.tileHighlight.slice();
    tileHighlight[i] = false;
    this.setState({
      tileHighlight: tileHighlight
    })
  }

  render() {
    var tiles = [];

    for (var c = 0; c < this.state.columns; c++) {
      for (var r = 0; r < this.state.rows; r++) {
        let id = r * this.state.columns + c;
        tiles.push(
          <Tile 
          x={ 2 * margin + c * (this.state.tile_width + this.state.tile_margin) }
          y={ 2 * margin + r * (this.state.tile_height + this.state.tile_margin) }
          width={ this.state.tile_width }
          height={ this.state.tile_height }
          color={this.state.tileHighlight[id] || this.state.tileActive[id]? tile_color:tile_highlight_color}
          id={id}
          shape={this.state.tilePattern[id]}
          active={this.state.tileActive[id] || this.state.tileSolved[id]}
          onClick={()=>this.handleClick(id)}
          onHover={()=>this.handleHover(id)}
          onBlur={()=>this.handleBlur(id)}

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
          rows={rows}
          columns={columns}
          height={board_height}
          width={board_width}
        />
    )
  }
}

export default App;

const shapes = [Ellipse, Square, Circle, Rectangle];

function makePattern(shape_id, offset_x, offset_y, width_mult, height_mult, color){
  return function(props) {
    const ox = (props.width * 0.33 * offset_x);
    const oy = (props.height * 0.33 * offset_y);
    const width = width_mult * (props.width - ox)  * 0.7;
    const height = height_mult * ( props.height - oy) * 0.7 ;
    const MyShape = shapes[shape_id];
    return (
      <MyShape
        x={props.x}
        y={props.y}
        tile_width={props.width}
        tile_height={props.height}
        width={width}
        height={height}
        offset_x={ox}
        offset_y={oy}
        color={color}
      />
    ) 
  }
}



const gameTiles = Array(NUMBER_OF_PATTERNS).fill(0).map( v => RandomDoubleShapeComp())
console.log(gameTiles)




function RandomShapeComp() {
  let shape_id = Math.floor(Math.random() * shapes.length);
  let offset_x = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let offset_y = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let width_mult = 0.5 + (Math.pow(Math.random(), 0.5)/2);
  let height_mult = 0.5 + (Math.pow(Math.random(), 0.5)/2);
  let color = randomColor();
  return makePattern(shape_id, offset_x, offset_y, width_mult,height_mult, color);
}

function RandomDoubleShapeComp() {
  let shape_id = Math.floor(Math.random() * shapes.length);
  let offset_x = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let offset_y = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let width_mult = 0.4 + (Math.pow(Math.random(), 0.5)/2);
  let height_mult = 0.4 + (Math.pow(Math.random(), 0.5)/2);
  let color = randomColor();
  let P1 =  makePattern(shape_id, offset_x, offset_y, width_mult,height_mult, color);
  let offset_x2 = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let offset_y2 = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let shape_id2 = Math.floor(Math.random() * shapes.length)
  let width_mult2 =  0.2 + (Math.pow(Math.random(), 0.5)/3);
  let height_mult2 =  0.2 + (Math.pow(Math.random(), 0.5)/3);
  // console.log('MULT!')
  // console.log(height_mult2)
  let color2 = randomColor();
  let P2 =  makePattern(shape_id2, offset_x2, offset_y2, width_mult2,height_mult2, color2);
  return function(props) {
    return (
      <g opacity={props.opacity}>
      <P1
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
      />
      <P2
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
      />
      </g>
      )
  }
}





function RandomShape(props) {
  let shape_id = Math.floor(Math.random() * shapes.length);
  let offset_x = Math.random()/2;
  let offset_y = Math.random()/2;
  let width_mult = 0.5 + (Math.pow(Math.random(), 0.5)/2);
  let height_mult = 0.5 + (Math.pow(Math.random(), 0.5)/2);
  let color = randomColor();
  const MyWrapper = makePattern(shape_id, offset_x, offset_y, width_mult,height_mult, color);
  return (
    <MyWrapper 
      x={props.x}
      y={props.y}
      width={props.width}
      height={props.height}
      />
  )
}

function randomColor() {
  const choices = ["4","8","b","e"];
  let color = "#";
  color += choices[Math.floor(Math.random() * choices.length)]
  color += choices[Math.floor(Math.random() * choices.length)]
  color += choices[Math.floor(Math.random() * choices.length)]
  return color
}



// 'Knuth Shuffle' taken from https://github.com/Daplie/knuth-shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}