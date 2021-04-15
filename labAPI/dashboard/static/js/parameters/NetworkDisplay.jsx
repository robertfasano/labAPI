import React from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import IconButton from '@material-ui/core/IconButton'
import { connect } from 'react-redux'
import { get } from '../utilities.js'
import InstrumentDisplay from './InstrumentDisplay.jsx'
import SaveLoadButtons from './SaveLoadButtons.jsx'
import FilterPopover from './FilterPopover.jsx'
import { unflatten } from 'flat';
import JSON5 from 'json5'

function NetworkDisplay(props) {
  const [expanded, setExpanded] = React.useState(props.instruments)
  function toggleExpandAll() {
    if (expanded.length < props.instruments.length) setExpanded(props.instruments)
    else setExpanded([])
  }


  function sync() {
    get('/parameters', (response) => {
      response = JSON5.parse(JSON.stringify(response))
      for (const [path, value] of Object.entries(response)) {
        props.dispatch({type: 'parameters/update', path: path, value: value})
      }
    })
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      sync()
    }, 1000);
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
  console.log(visibleParameters)
  const topLevelParameters = Object.keys(visibleParameters)

  return (
    <Box mx={3} width='500px'>
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

      <Grid container item xs={12} direction="column">
        {Object.entries(visibleParameters).map(([key, val], i) => (
          <Box mx={1} my={1} width={1}>
            <InstrumentDisplay name={key}
                          expanded={expanded}
                          setExpanded={setExpanded}
                          subitems={val}
                          key={key}
                          path={key}
                          />
          </Box>
        ))
        }
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
