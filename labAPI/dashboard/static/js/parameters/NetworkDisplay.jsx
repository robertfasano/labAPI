import React from 'react';
import Paper from "@material-ui/core/Paper";
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import IconButton from '@material-ui/core/IconButton';

import { connect } from 'react-redux'
import { get, post } from '../utilities.js'

import InstrumentDisplay from './InstrumentDisplay.jsx'
import SaveLoadButtons from './SaveLoadButtons.jsx'
import FilterPopover from './FilterPopover.jsx'
import FilterGroup from './FilterGroup.jsx'

import {flatten, unflatten} from 'flat';

function NetworkDisplay(props) {
  const [expanded, setExpanded] = React.useState([])
  function toggleExpandAll() {
    if (expanded.length < props.instruments.length) setExpanded(props.instruments)
    else setExpanded([])
  }

  function sync() {
    get('/parameters', (response) => {
      for (const [path, value] of Object.entries(response)) {
        props.dispatch({type: 'parameters/update', path: path, value: value})
      }
    })
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      sync()
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const [filterText, setFilterText] = React.useState('')
  const [parameterFilter, setParameterFilter] = React.useState('all')

  // decide which parameters render based on filter state
  let visibleParameters = {}
  for (const [addr, state] of Object.entries(props.parameters)) {
    let allowedByText = (addr.toLowerCase().includes(filterText.toLowerCase()) || filterText == '')
    let allowedByClass = (parameterFilter == state.type || parameterFilter == 'all')
    let subpath = addr.slice(0, addr.lastIndexOf('/'))
    if (allowedByText & allowedByClass) {
      visibleParameters[addr] = state
    }
  }
  visibleParameters = unflatten(visibleParameters,  {delimiter: '/'})

  return (
    <Box mx={3}>

    <Box ml={5} mr={-3}>
    <Grid container>
      <Grid item xs={1}>
        <FilterPopover filterText={filterText} setFilterText={setFilterText} parameterFilter={parameterFilter} setParameterFilter={setParameterFilter}/>
      </Grid>
      <Grid item xs={6}/>
      <Grid item xs={4}>
        <SaveLoadButtons/>
      </Grid>
      <Grid item container xs={1} justify='flex-end'>
        <IconButton aria-label="update" onClick={toggleExpandAll} color="primary">
          {expanded.length<Object.keys(props.instruments).length? (<ExpandMoreIcon/>): <ExpandLessIcon/>}
        </IconButton>
      </Grid>
    </Grid>
    </Box>

    <Grid container spacing={2}>
    <Grid container item xs={6} direction="column">
    {Object.entries(visibleParameters).map(([key, val], i) => (
      !(i%2)?
      <Box mx={1} my={1} width={1}>

        <InstrumentDisplay name={key}
                       expanded={expanded}
                       setExpanded={setExpanded}
                       subitems={val}
                       key={key}
                       path={key}
                       />
      </Box>
      : null

    ))
    }
    </Grid>

    <Grid container item xs={6} direction="column">

    {Object.entries(visibleParameters).map(([key, val], i) => (
      i%2?
      <Box mx={1} my={1} width={1}>

        <InstrumentDisplay name={key}
                       expanded={expanded}
                       setExpanded={setExpanded}
                       subitems={val}
                       key={key}
                       path={key}
                       />
      </Box>
      : null

    ))
    }
    </Grid>
    </Grid>

    </Box>
  )
}

function mapStateToProps(state, ownProps){
  return {
          instruments: state['instruments'],
          parameters: state['parameters']
          }
}
export default connect(mapStateToProps)(NetworkDisplay)
