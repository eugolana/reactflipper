import React, { Component } from 'react';
import './App.css';

// Game parameter globals
const columns = 10;
const rows = 4;
const NUMBER_OF_PATTERNS = Math.floor((rows*columns));//this is more than will be used, but it assures less doubles

// style globals
const corner_radius = 2;

const background_color = '#ccc'
const tile_color = '#ddd'
const tile_highlight_color = '#bbb'
const colorchoices = Array(3).fill(['c', 'd', 'e', 'f']);
const BW = false;

class App extends Component {
  constructor(props) {
    super(props);
    this.checkWidth();
    this.state = {
      board_width: window.innerWidth,
      board_height: window.innerHeight,
      game: 0
    }
  }
  checkWidth() {
    if (window.innerWidth < window.innerHeight) {
      this.rows = columns;
      this.columns = rows;    
    } else {
      this.rows = rows;
      this.columns = columns;
    }
  }
  reset(){
    this.checkWidth();
    this.setState({
        board_width: window.innerWidth,
        board_height: window.innerHeight,
      game: this.state.game + 1
    })
  }

  render() {
    return (
        <Board 
          key={this.state.game}
          rows={this.rows}
          columns={this.columns}
          height={this.state.board_height}
          width={this.state.board_width}
          reset={()=>this.reset()}
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
    this.reset = props.reset;
    let tile_width = ((props.width ) / props.columns)  * 0.9;
    let tile_margin = tile_width * 0.1;
    let tile_height = ((props.height - tile_margin ) / props.rows)  - tile_margin;

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
      let width = window.innerWidth ;
      let height = window.innerHeight ;
      let tile_width = (width / _this.columns)  * 0.9;
      let tile_margin = tile_width * 0.1;
      let tile_height = ((height - tile_margin) / _this.rows) - tile_margin;

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
          console.log('matched');
          console.log(this.state.tileSolved)
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

  renderWinMessage(){
    if (this.state.tileSolved.every( v => v === 1 )) {
      return (
        <Win width={this.state.width} height={this.state.height} reset={this.reset}/>
      )
    } else {
      return
    }
  }

  render() {
    var tiles = [];

    for (var c = 0; c < this.columns; c++) {
      for (var r = 0; r < this.rows; r++) {
        let id = r * this.columns + c;
        tiles.push(
          <Tile 
          x={ this.state.tile_margin + c * (this.state.tile_width + this.state.tile_margin) }
          y={this.state.tile_margin + r * (this.state.tile_height + this.state.tile_margin) }
          width={ this.state.tile_width }
          height={ this.state.tile_height }
          color={this.state.tileHighlight[id] || this.state.tileActive[id]? tile_color:tile_highlight_color}
          id={id}
          shape={this.tile_choices[this.state.tilePattern[id]]}
          showing={this.state.tileActive[id] || this.state.tileSolved[id]}
          onClick={()=>this.handleClick(id)}
          onHover={()=>this.handleHover(id)}
          onBlur={()=>this.handleBlur(id)}

          />
        );
      }
    }

    return (
      <div className="board">
        <svg id="boardSVG" height={this.state.height} width={this.state.width}>
        <Filters/>
          <rect 
            x="0" 
            y="0"
            width={this.state.width} 
            height={this.state.height} 
            fill={background_color} 
            rx={corner_radius} 
            ry={corner_radius}>
          </rect>
          {tiles}            
          {this.renderWinMessage()}
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
          filter: "url(#speckle)",
          cursor: "pointer"
          }}
      >
      </rect>
      <MyShape     
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        showing={props.showing}
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
      color: props.color? props.color : '#888888',
      showing: props.showing
    };
  }
  componentWillReceiveProps(props) {
    if (props.showing) {
      console.log('showing')
    }
    this.setState({
      centerX: props.x + (props.tile_width / 2) + (props.offset_x? props.offset_x : 0),
      centerY: props.y + (props.tile_height / 2) +(props.offset_y? props.offset_y : 0),
      tile_width: props.tile_width,
      tile_height: props.tile_height,
      width: props.width ? props.width : props.tile_width * 0.6,
      height: props.height ? props.height : props.tile_height * 0.6,
      color: props.color? props.color : '#888888',
      showing: props.showing
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
    this.state.ry = this.state.height / 2;
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
        className={this.state.showing? "showing": "hidden"}
        cx={this.state.centerX}
        cy={this.state.centerY}
        rx={this.state.rx}
        ry={this.state.ry}
        fill={this.state.color}
        style={{
          filter: "url(#dropshadow)",
          cursor: "pointer"
        }}
      >
      </ellipse>
    )
  }
}

class Circle extends Ellipse {
  constructor(props) {
    super(props);
     this.state.ry = this.state.rx = Math.min(this.state.rx, this.state.ry);
  }
  extraProps(props) {
    let r = Math.min(props.width, props.height) /2;
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
  extraProps(props) {
    // for some subclass reason I think i need to define this..
  }
  render() {
    return (
      <rect
      className={this.state.showing? "showing": "hidden"}
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
    let minSize = Math.min(props.width, props.height);
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
        showing={props.showing}
      />
    ) 
  }
}

function makePatternWrapper(shapes){
  let shape = shapes[Math.floor(Math.random() * shapes.length)];
  let offset_x = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let offset_y = Math.random()/2 * (Math.random() > 0.5? -1: 1);
  let width_mult = 0.4 + (Math.pow(Math.random(), 0.5)/2);
  let height_mult = 0.4 + (Math.pow(Math.random(), 0.5)/2);
  let color = randomColor(colorchoices, BW);
  return  makePattern(shape, offset_x, offset_y, width_mult,height_mult, color);

}


function RandomDoubleShapeComp(shapes) {
  const P1 = makePatternWrapper(shapes);
  const P2 = makePatternWrapper(shapes);
  return function(props) {
    return (
      <g 
      filter="url(#speckle)">
        <P1
          x={props.x}
          y={props.y}
          width={props.width}
          height={props.height}
          showing={props.showing}
        />
        <P2
          x={props.x}
          y={props.y}
          width={props.width}
          height={props.height}
          showing={props.showing}
        />
      </g>
      )
  }
}



function Filters(props) {
  return (
    <g>
      <filter id="dropshadow" height="130%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2d"/> 
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
        <feTurbulence result="noise" baseFrequency=".002" numOctaves="2" seed="99" />
        <feColorMatrix in="noise" result="noisebw" type="saturate" values="0.3" />
        <feComposite in="noisebw" in2="SourceGraphic" operator="in" result="shapedNoise"/>
        <feBlend in="SourceGraphic" in2="shapedNoise" result="noised" mode="multiply"/>
        <feGaussianBlur in="noised" result="blurred" stdDeviation="0.5"/> 
      </filter>

          <filter id="displace">
      <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="4" result="turbed"/>
      <feDisplacementMap in="SourceGraphic" in2="turbed" scale="6"
         xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="speckle">
      <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="4" result="turbed"/>
      <feDisplacementMap in="SourceGraphic" in2="turbed" scale="3"
         xChannelSelector="R" yChannelSelector="G" result="graphic"/>



      <feTurbulence type="turbulence" baseFrequency="0.7" numOctaves="4" result="turbed" seed="432"/>
      <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="4" result="turbed2" seed="199"/>
      <feBlend in="turbed" in2="turbed2" mode="multiply" result="turb"/>

      <feColorMatrix in="turb" type="saturate" values="0.01" result="turbedbw"/>

      <feComposite in="turbedbw" in2="graphic" operator="atop" result="shapedTurbedbw"/>

      <feBlend in="graphic" in2="shapedTurbedbw" mode="multiply" />

    </filter>

      </g> 
        )
}

function Win(props){
  return (
    <g>
      <text
      className="slowshow" 
        x="50%"
        y="50%"
        font-size={200 * props.width/1500}
        font-weight="bold"
        text-anchor="middle"
        stroke='#866'
        stroke-width={ 5 * props.width/1500}
        fill='#ddd'
        stroke-linejoin="round"
        filter="url(#distort)"
        >
        YOU WON!
      </text>

      <rect 
        id="reset"
        className="slowshow"
        x="30%"
        y="70%"
        rx={corner_radius}
        ry={corner_radius}
        width="40%"
        height="20%"
        fill="#ddd"
        stroke="#866"
        stroke-width={7 * props.width/1500}
        stroke-linejoin="round"
        onClick={props.reset}
        style={{
          cursor: "pointer"
        }}
        filter="url(#distort)"
        />

      <text
        id="resetText"
        className="slowshow" 
        x="50%"
        y="82%"
        font-size={70 * props.width/1500}
        font-weight="bolder"
        text-anchor="middle"
        stroke='#866'
        stroke-width={ 5 * props.width/1500}
        fill='#ddd'
        stroke-linejoin="round"
        onClick={props.reset}
        style={{
          cursor: "pointer"
        }}
        filter="url(#distort)"
      > 
        RESET
      </text>
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