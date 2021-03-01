import React from 'react';
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { connect } from 'react-redux'
import Checkbox from "@material-ui/core/Checkbox";
import ValidatedInput from '../components/ValidatedInput.jsx'
import IconButton from '@material-ui/core/IconButton';
import CachedIcon from "@material-ui/icons/Cached";
import SendIcon from "@material-ui/icons/Send";
import TimelineIcon from '@material-ui/icons/Timeline';
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { GiRoundKnob } from 'react-icons/gi';
import { HiSelector } from 'react-icons/hi'
import { BsToggleOn } from 'react-icons/bs'
import { AiTwotoneExperiment } from 'react-icons/ai'
import { get, post } from '../utilities.js'

function ParameterRow(props) {
  // console.log(props.path, props.data)


  if (!props.isVisible) {
    return null
  }
  if (props.data.type == 'switch') {
    function handleToggle(event) {
      event.stopPropagation()
      const newState = Boolean(1 - props.data.value)
      props.dispatch({type: 'parameters/update', path: props.path, value: newState})
      post('/parameters/' + props.path, {'value': newState})
    }

    return (
      <React.Fragment>
        <TableRow key={props.path} hover>
          <TableCell><BsToggleOn size={20} color='#8f8f8f'/></TableCell>
          <TableCell>{props.name}</TableCell>
          <TableCell/>
          <TableCell/>
          <TableCell align='right'>
            <Switch
              checked={props.data.value}
              onChange={(event) => handleToggle(event)}
            />
          </TableCell>
          <TableCell/>
        </TableRow>
      </React.Fragment>
    )
  }


 if (props.data.type == 'selector') {
    function handleChange(event) {
      event.stopPropagation()
      const value = event.target.value
      props.dispatch({type: 'parameters/update', path: props.path, value: value})
      post('/parameters/' + props.path, {'value': value})
    }

    return (
      <React.Fragment>
        <TableRow key={props.path} hover>
          <TableCell><HiSelector size={20} color='#8f8f8f'/></TableCell>
          <TableCell>{props.name}</TableCell>
          <TableCell/>
          <TableCell/>
          <TableCell align='right'>
            <Select value={props.data.value}
                    style={{width: 80}}
                    onChange={(event) => handleChange(event)}
                    >
              {props.data.options.map((row, index) => {
                  return (
                    <MenuItem key={row} value={row}>{row}</MenuItem>
                    )
                  }
                )
              }
            </Select>
          </TableCell>
          <TableCell/>
        </TableRow>
      </React.Fragment>
    )
  }


  if (props.data.type == 'knob') {
    function send(event) {
      const value = event.target.value
      post('/parameters/' + props.path, {'value': value})
      props.dispatch({type: 'parameters/update', path: props.path, value: value})
    }

    return (
      <React.Fragment>
        <TableRow key={props.path} hover>
          <TableCell><GiRoundKnob size={20} color='#8f8f8f'/></TableCell>
          <TableCell>{props.name}</TableCell>
          <TableCell/>
          <TableCell/>
          <TableCell/>
          <TableCell align='right'>
            <ValidatedInput placeholder={props.data.value}
                            min={props.data.min}
                            max={props.data.max}
                            onKeyPress={send}
            />
          </TableCell>
        </TableRow>
      </React.Fragment>
    )
  }

  if (props.data.type == 'measurement') {
    let value = ''
    if (props.value != null) {
      value = props.value.toFixed(3)
    }

    function updateUnit(event) {
      props.dispatch({type: 'parameters/setUnit', path: props.path, value: event.target.value})
    }

    return (
      <React.Fragment>
        <TableRow key={props.path} hover>
          <TableCell><AiTwotoneExperiment size={20} color='#8f8f8f'/></TableCell>
          <TableCell>{props.name}</TableCell>
          <TableCell align="left">
            <IconButton onClick={() => props.dispatch({type: 'plotting/toggle', path: props.path})} color={props.plotted? 'primary': 'default'}>
              <TimelineIcon/>
            </IconButton>
          </TableCell>
          <TableCell/>
          <TableCell>
            {Object.keys(props.data.value).length > 1? (
            <Select value={props.data.unit}
                    style={{width: 80}}
                    onChange={updateUnit}
                    >
              {Object.keys(props.data.value).map((row, index) => {
                  return (
                    <MenuItem key={row} value={row}>{row}</MenuItem>
                    )
                  }
                )
              }
            </Select>
          ) : null }
          </TableCell>

          <TableCell align='right'>
            <TextField value={value} disabled={true} style={{width: 80}}/>
          </TableCell>
        </TableRow>
      </React.Fragment>
    )
  }

}

function mapStateToProps(state, ownProps){
  let data = state['parameters'][ownProps.path]
  return {
          data: data,
          value: data.value[data.unit],
          plotted: Object.keys(state['plotting'].data).includes(ownProps.path)

        }
}

export default connect(mapStateToProps)(ParameterRow)
