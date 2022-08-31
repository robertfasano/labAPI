import React from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import IconButton from '@mui/material/IconButton'
import { connect } from 'react-redux'
import InstrumentDisplay from './InstrumentDisplay.jsx'
import SaveLoadButtons from './SaveLoadButtons.jsx'
import FilterPopover from './FilterPopover.jsx'
import { unflatten } from 'flat'
import JSON5 from 'json5'

function NetworkDisplay(props) {
  const [expanded, setExpanded] = React.useState([])
  const [expandedTopLevel, setExpandedTopLevel] = React.useState('')

  function toggleExpandAll() {
    if (expanded.length < props.instruments.length) setExpanded(props.instruments)
    else setExpanded([])
  }

  const [filterText, setFilterText] = React.useState('')
  const [parameterFilter, setParameterFilter] = React.useState('all')

  // decide which parameters render based on filter state
  let visibleParameters = {}
  for (const [addr, state] of Object.entries(props.parameters)) {
    let allowedByText = (addr.toLowerCase().includes(filterText.toLowerCase()) || filterText == '')
    let allowedByClass = (parameterFilter == state.type || parameterFilter == 'all')
    if (allowedByText & allowedByClass & !addr.includes('labAPI')) {
      visibleParameters[addr] = state
    }
  }
  visibleParameters = unflatten(visibleParameters,  {delimiter: '/'})
  const width = Math.min(window.innerWidth, 540)

  return (
    <Box sx={{ width: width, mx: 3 }}>
      <Box sx={{ ml: 5, mr:-3 }}>
        <Grid container>
          <Grid item xs={1}>
            <FilterPopover filterText={filterText} setFilterText={setFilterText} parameterFilter={parameterFilter} setParameterFilter={setParameterFilter}/>
          </Grid>
          <Grid item xs={10}>
            <SaveLoadButtons/>
          </Grid>
          <Grid item container xs={1} justifyContent='flex-end'>
            <IconButton aria-label="update" onClick={toggleExpandAll} color="primary">
              {expanded.length<Object.keys(props.instruments).length? (<ExpandMoreIcon/>): <ExpandLessIcon/>}
            </IconButton>
          </Grid>
        </Grid>
      </Box>

      {Object.entries(visibleParameters).map(([key, val], i) => (
        <InstrumentDisplay name={key}
                      expanded={expanded}
                      setExpanded={setExpanded}
                      expandedTopLevel={expandedTopLevel}
                      setExpandedTopLevel={setExpandedTopLevel}
                      subitems={val}
                      key={key}
                      path={key}
                      topLevel={true}
                      />
      ))
      }
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
