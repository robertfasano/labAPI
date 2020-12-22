import React from 'react';
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import Plot from 'react-plotly.js';
import Typography from '@material-ui/core/Typography';
import PlotPanel from './PlotPanel.jsx'
import { get, post } from '../utilities.js'

import { connect } from 'react-redux'
import {sortableContainer, sortableElement} from 'react-sortable-hoc';
import arrayMove from 'array-move';
const SortableItem = sortableElement(({path}) => <Box mb={2}><PlotPanel path={path}/></Box>);
const SortableContainer = sortableContainer(({children}) => {
  return <Box>{children}</Box>;
});


function PlotContainer(props) {
  function refresh() {

    post('/history', {paths: props.units}, (response) => {
      for (let path of Object.keys(response)) {
        props.dispatch({type: 'plotting/setData', path: path, data: response[path]})

      }
    })
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      refresh()
    }, 1000);
    return () => clearInterval(interval);
  }, [props.parameters]);

  const onSortEnd = ({oldIndex, newIndex}) => {
    if (oldIndex == undefined || newIndex == undefined) {
      return
    }
    const oldPath = props.paths[oldIndex]
    props.dispatch({type: 'plotting/moveToIndex', path: oldPath, index: newIndex})

  };

  return (
    <Box width='100%' height='100%'>
    <SortableContainer onSortEnd={onSortEnd} lockAxis='y' useDragHandle useWindowAsScrollContainer lockToContainerEdges>
      {props.paths.map((path, index) => (
          <SortableItem key={path} index={index} path={path} style={{zIndex: 99999999}}/>
      ))}
    </SortableContainer>
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
