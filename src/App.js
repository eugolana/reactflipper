import React, { Component } from 'react';
import './App.css';

// Game parameter globals
const columns = 12;
const rows = 3;
const NUMBER_OF_PATTERNS = Math.floor((rows*columns)/2);

// style globals
const margin = 10;
const corner_radius = 4;

const background_color = '#ccc'
const tile_color = '#cdf'
const tile_highlight_color = '#abd'
const colorchoices = Array(3).fill(['C','D','E','F']);
const BW = false;

class App extends Component {
  constructor(props) {
    super(props);
    this.rows = rows;
    this.columns = columns;
    this.margin = 10;
    this.state = {
      board_width: window.innerWidth - (2 * margin),
      board_height: window.innerHeight - (2 * margin)
    }
  }

  render() {
    return (
        <Board 
          rows={rows}
          columns={columns}
          height={this.state.board_height}
          width={this.state.board_width}
          margin={this.margin}
        />
    )
  }
}

export default App;

class Board extends Component {
  constructor(props) {
    super(props);
    this.rows = props.rows;
    this.columns = props.columns;
    this.cell_count = props.rows * props.columns;
    let tile_width = ((props.width - margin) / props.columns)  * 0.9;
    let tile_margin = tile_width * 0.1;
    let tile_height = ((props.height - margin) / props.rows)  - tile_margin;

    let shapes = [Ellipse, Square, Circle, Rectangle];
    this.tile_choices = Array(NUMBER_OF_PATTERNS).fill(0).map( v => RandomDoubleShapeComp(shapes))
    let patterns = Array(this.cell_count / 2).fill(0).map(v => Math.floor(Math.random() * NUMBER_OF_PATTERNS));
    patterns = shuffle(patterns.concat(patterns));

    this.state = {
      width: props.width,
      height: props.height,
      tile_width: tile_width,
      tile_height: tile_height,
      tile_margin: tile_margin,
      tilePattern: patterns,
      tileActive: Array(this.cell_count).fill(0),
      tileHighlight: Array(this.cell_count).fill(0),
      tileSolved: Array(this.cell_count).fill(0)
    }
    window.onresize = this.handleResize();
  }
  handleResize() {
    // Called on window.onresize event
    let _this = this;
    return function() {
      let width = window.innerWidth - (2 * margin);
      let height = window.innerHeight - (2 * margin);
      let tile_width = ((width - margin) / _this.columns)  * 0.9;
      let tile_margin = tile_width * 0.1;
      let tile_height = ((height - margin) / _this.rows)  - tile_margin;

      _this.setState({
        width: width,
        height: height,
        tile_width: tile_width,
        tile_height: tile_height,
        tile_margin: tile_margin 
      })
    }
  }

  handleClick(id) {
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
        if (active_patterns[0] === active_patterns[1]) {
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

    for (var c = 0; c < this.columns; c++) {
      for (var r = 0; r < this.rows; r++) {
        let id = r * this.columns + c;
        tiles.push(
          <Tile 
          x={ 2 * margin + c * (this.state.tile_width + this.state.tile_margin) + this.state.tile_margin/2 }
          y={ 2 * margin + r * (this.state.tile_height + this.state.tile_margin) }
          width={ this.state.tile_width }
          height={ this.state.tile_height }
          color={this.state.tileHighlight[id] || this.state.tileActive[id]? tile_color:tile_highlight_color}
          id={id}
          shape={this.tile_choices[this.state.tilePattern[id]]}
          active={this.state.tileActive[id] || this.state.tileSolved[id]}
          onClick={()=>this.handleClick(id)}
          onHover={()=>this.handleHover(id)}
          onBlur={()=>this.handleBlur(id)}

          />
        );
      }
    }

    return (
      <div className="board">
        <svg id="boardSVG" height={this.state.height + 20} width={this.state.width + 20}>
        <Filters/>
          <rect 
            x={margin} 
            y={margin} 
            width={this.state.width} 
            height={this.state.height} 
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



function Tile(props){
  const MyShape = props.shape;
  return (
    <g 
    onMouseOver={props.onHover}
    onMouseLeave={props.onBlur}
    onClick={props.onClick}
    style={{
      filter: "url(#distort)"
    }}
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
        className="tile"
        style={{
          filter: "url(#dropshadow)",
          cursor: "pointer"
          }}
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
  componentWillReceiveProps(props) {
    this.setState({
      centerX: props.x + (props.tile_width / 2) + (props.offset_x? props.offset_x : 0),
      centerY: props.y + (props.tile_height / 2) +(props.offset_y? props.offset_y : 0),
      tile_width: props.tile_width,
      tile_height: props.tile_height,
      width: props.width ? props.width : props.tile_width * 0.6,
      height: props.height ? props.height : props.tile_height * 0.6,
      color: props.color? props.color : '#888888'
     });  
    this.extraProps(props);
  }
  extraProps(props){
    // 
  }
}

class Ellipse extends Shape {
  constructor(props) {
    super(props);
    this.state.rx = this.state.width / 2;
    this.state.ry = this.state.height / 2
  }
  extraProps(props) {
    this.setState({
      rx: this.state.width / 2,
      ry: this.state.height / 2
    })
  }
  render() {
    return (
      <ellipse 
        cx={this.state.centerX}
        cy={this.state.centerY}
        rx={this.state.rx}
        ry={this.state.ry}
        fill={this.state.color}
        style={{
          filter: "url(#dropshadow)",
          cursor: "pointer"
        }}
      />
    )
  }
}

class Circle extends Ellipse {
  constructor(props) {
    super(props);
     this.state.ry = this.state.rx = Math.min(this.state.rx, this.state.ry);
  }
  extraProps(props) {
    let r = Math.min(this.state.width, this.state.height) /2;
    this.setState({
      rx: r,
      ry: r
    })
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
      style={{
          filter: "url(#dropshadow)",
            cursor: "pointer"
          }}
      />
    )
  }
}

class Square extends Rectangle {
  constructor(props) {
    super(props);
    this.state.height = this.state.width = Math.min(this.state.width, this.state.height);
    
  }
  extraProps(props) {
    let minSize = Math.min(this.state.width, this.state.height);
    this.setState({
      width: minSize,
      height: minSize
    })
  }
}

function makePattern(shape, offset_x, offset_y, width_mult, height_mult, color){
  return function(props) {
    const ox = (props.width * 0.33 * offset_x);
    const oy = (props.height * 0.33 * offset_y);
    const MyShape = shape;
    return (
      <MyShape
        x={props.x}
        y={props.y}
        tile_width={props.width}
        tile_height={props.height}
        width={width_mult * (props.width - ox)  * 0.7}
        height={height_mult * ( props.height - oy) * 0.7}
        offset_x={ox}
        offset_y={oy}
        color={color}
      />
    ) 
  }
}



function RandomDoubleShapeComp(shapes) {
  let shape1 = shapes[Math.floor(Math.random() * shapes.length)];
  let offset_x = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let offset_y = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let width_mult = 0.4 + (Math.pow(Math.random(), 0.5)/2);
  let height_mult = 0.4 + (Math.pow(Math.random(), 0.5)/2);
  let color = randomColor(colorchoices, BW);
  let P1 =  makePattern(shape1, offset_x, offset_y, width_mult,height_mult, color);
  let offset_x2 = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let offset_y2 = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let shape2 = shapes[Math.floor(Math.random() * shapes.length)];
  let width_mult2 =  0.2 + (Math.pow(Math.random(), 0.5)/3);
  let height_mult2 =  0.2 + (Math.pow(Math.random(), 0.5)/3);
  let color2 = randomColor(colorchoices, BW);
  let P2 =  makePattern(shape2, offset_x2, offset_y2, width_mult2, height_mult2, color2);
  return function(props) {
    return (
      <g opacity={props.opacity}
      filter="url(#distort)">
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



function Filters(props) {
  return (
    <g>
      <filter id="dropshadow" height="130%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/> 
        <feOffset dx="0.5" dy="0.5" result="offsetblur"/> 
        <feComponentTransfer>
          <feFuncA type="linear" slope="2"/>
        </feComponentTransfer>
        <feMerge> 
          <feMergeNode/> 
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="distort">
        <feTurbulence result="TURBULENCE" baseFrequency="0.5" numOctaves="7" seed="77"  />
        <feDisplacementMap in="SourceGraphic" in2="TURBULENCE" result="distorted" scale="2" />
        <feTurbulence result="noise" baseFrequency=".002" numOctaves="2" seed="99" />
        <feColorMatrix in="noise" result="noisebw" type="saturate" values="0.3" />
        <feComposite in="noisebw" in2="distorted" operator="in" result="shapedNoise"/>
        <feBlend in="distorted" in2="shapedNoise" result="noised" mode="multiply"/>
        <feGaussianBlur in="noised" result="blurred" stdDeviation="0.5"/> 

      </filter>

        <filter id="paperEffect">
        <feMerge> 
          <feMergeNode in="SourceGraphic"/>
        </feMerge>  

      </filter>
      </g>
        )
}

function randomColor(colorchoices, bw=false) {
  if (bw) {
    let brightness = colorchoices[0][Math.floor(Math.random() * colorchoices[0].length)]
    return `#${brightness}${brightness}${brightness}`
  }
  let color = "#";
  color += colorchoices[0][Math.floor(Math.random() * colorchoices[0].length)]
  color += colorchoices[1][Math.floor(Math.random() * colorchoices[1].length)]
  color += colorchoices[2][Math.floor(Math.random() * colorchoices[2].length)]
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