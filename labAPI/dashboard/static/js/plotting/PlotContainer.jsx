import React from 'react'
import Box from "@material-ui/core/Box"
import PlotPanel from './PlotPanel.jsx'
import RGL, { WidthProvider } from "react-grid-layout";
import 'react-grid-layout/css/styles.css' 
import 'react-resizable/css/styles.css' 
import { post } from '../utilities.js'
import { connect } from 'react-redux'


function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem("rgl-7")) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
      "rgl-7",
      JSON.stringify({
        [key]: value
      })
    );
  }
}


const ReactGridLayout = WidthProvider(RGL);

function PlotContainer(props) {
  function refresh() {

    post('/history', {paths: props.units}, (response) => {
      for (let path of Object.keys(response)) {
        props.dispatch({type: 'plotting/setData', path: path, data: response[path]})

      }
    })
  }

  const [renderTime, setRenderTime] = React.useState(Date.now())

  React.useEffect(() => {
    const interval = setInterval(() => {
      refresh()
    }, 1000);
    return () => clearInterval(interval);
  }, [props.parameters]);


  const layout = getFromLS("layout") || [];

  const columns = 3

  if (layout.length == 0) {
    let x = 0
    for (let path of props.paths) {
      layout.push({i: path, x: x % columns, y: Math.floor(x / columns), w: 1, h: 1})
      x = x + 1
    }
  }


  const onResize = (props) => {
    setRenderTime(Date.now())
  }

  const onLayoutChange = (layout) => {
    setRenderTime(Date.now())
    saveToLS("layout", layout);
  }

  return (
    <Box width='100%' height='100%'>
      <ReactGridLayout layout={layout} cols={columns} rowHeight={275} draggableHandle=".drag-handle" onResize={onResize} onLayoutChange={onLayoutChange}>
        {props.paths.map((path, index) => (
            <div key={path}>
              <PlotPanel path={path} date={renderTime}/>
            </div>
        ))}
      </ReactGridLayout>
    </Box>
  )
}

function mapStateToProps(state, ownProps){
  let units = {}
  let paths = state.plotting.parameters
  for (let path of paths) {
    units[path] = state['parameters'][path].unit
  }

  return {
          parameters: state['plotting'].data,
          paths: paths,
          units: units
        }
}

export default connect(mapStateToProps)(PlotContainer)
