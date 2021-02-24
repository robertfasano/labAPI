import React from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import IconButton from '@material-ui/core/IconButton';

import { connect } from 'react-redux'
import { get, post } from '../utilities.js'

import InstrumentRow from './InstrumentRow.jsx'
import SaveLoadButtons from './SaveLoadButtons.jsx'
import FilterPopover from './FilterPopover.jsx'
import FilterGroup from './FilterGroup.jsx'

import {flatten, unflatten} from 'flat';

function ParameterTable(props) {
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
    <React.Fragment>
    <Paper elevation={3}>
      <TableContainer>
        <Table>
        <colgroup>
         <col style={{width:'5%'}}/>
         <col style={{width:'70%'}}/>
         <col style={{width:'20%'}}/>
         <col style={{width:'5%'}}/>
         </colgroup>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="left" padding="default">
              <FilterPopover filterText={filterText} setFilterText={setFilterText} parameterFilter={parameterFilter} setParameterFilter={setParameterFilter}/>
            </TableCell>
            <TableCell align="right" padding="none">
              <SaveLoadButtons/>
            </TableCell>
            <TableCell align='right' padding='default'>
              <IconButton aria-label="update" onClick={toggleExpandAll} color="primary">
                {expanded.length<Object.keys(props.instruments).length? (<ExpandMoreIcon/>): <ExpandLessIcon/>}
              </IconButton>
            </TableCell>
            <TableCell/>
          </TableRow>
        </TableHead>
        <TableBody>
            {Object.entries(visibleParameters).map(([key, val], i) => (
                <InstrumentRow name={key}
                               expanded={expanded}
                               setExpanded={setExpanded}
                               subitems={val}
                               key={key}
                               path={key}
                               />
            ))
            }
        </TableBody>
        </Table>
      </TableContainer>
    </Paper>
    </React.Fragment>
  )
}

function mapStateToProps(state, ownProps){
  return {
          instruments: state['instruments'],
          parameters: state['parameters']
          }
}
export default connect(mapStateToProps)(ParameterTable)
