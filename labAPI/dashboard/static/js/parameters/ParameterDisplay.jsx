import React from 'react'
import Box from "@mui/material/Box"
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { connect } from 'react-redux'
import ValidatedInput from '../components/ValidatedInput.jsx'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { get, post } from '../utilities.js'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { withSnackbar } from 'notistack'
import ScienceIcon from '@mui/icons-material/Science'
import TuneIcon from '@mui/icons-material/Tune'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ListIcon from '@mui/icons-material/List'
import CodeIcon from '@mui/icons-material/Code'

const rowHeight = '50px'

function Icon (type) {
  const props = {size: 20, sx: {color: '#8f8f8f'}}

  switch(type) {
    case 'switch':
      return <ToggleOnIcon {...props}/>
    case 'selector':
      return <ListIcon {...props}/>
    case 'knob':
      return <TuneIcon {...props}/>
    case 'function':
      return <CodeIcon {...props}/>
    case 'measurement':
      return <ScienceIcon {...props}/>
    default:
      return null
  }
}


function SwitchWidget (props) {
  function handleToggle(event) {
    event.stopPropagation()
    const newState = Boolean(1 - props.data.value)
    props.dispatch({type: 'parameters/update', path: props.path, value: newState})
    post('/parameters/' + props.path, {'value': newState})
  }
  return (
    <Switch
      checked={props.data.value}
      onChange={(event) => handleToggle(event)}
    />
  )
}

function SelectWidget (props) {
  function handleChange(event) {
    event.stopPropagation()
    const value = event.target.value
    props.dispatch({type: 'parameters/update', path: props.path, value: value})
    post('/parameters/' + props.path, {'value': value})
  }

  return (
    <Select value={props.data.value}
    style={{width: 100}}
    onChange={(event) => handleChange(event)}
    variant='standard'
    >
      {props.data.options.map((row, index) => {
        return (
          <MenuItem key={row} value={row}>{row}</MenuItem>
          )
        }
      )
      }
    </Select>
  )
}

function KnobWidget (props) {
  function send(event) {
    const value = parseFloat(event.target.value)
    post('/parameters/' + props.path, {'value': value})
    props.dispatch({type: 'parameters/update', path: props.path, value: value})
  }

  return (
    <ValidatedInput placeholder={parseFloat((Number(props.data.value).toFixed(3)))}
      min={props.data.min}
      max={props.data.max}
      onKeyPress={send}
    />
  )
}

function FunctionWidget (props) {
  function send() {
    get('/functions/' + props.path)
  }
  return (
    <IconButton onClick={send}>
      <PlayArrowIcon/>
    </IconButton>
  )
}

function MeasurementWidget (props) {
  let value = ''
  if (props.value != null) {
    value = props.value.toFixed(3)
  }

  return (
    <TextField value={value}
    InputProps={{style: {color: props.alert? '#FF0000': "rgba(0, 0, 0, 0.38)"}}}
    error={props.alert}
    style={{width: 100}}
    variant='standard'
  />
  )
}
function Widget (type, props) {
  switch(type) {
    case 'switch':
      return <SwitchWidget {...props}/>
    case 'selector':
      return <SelectWidget {...props}/>
    case 'knob':
      return <KnobWidget {...props}/>
    case 'function':
      return <FunctionWidget {...props}/>
    case 'measurement':
      return <MeasurementWidget {...props}/>
    default:
      return null
  }
}

function ParameterRow(props) {
  const [alertKey, setAlertKey] = React.useState('')
  React.useEffect(() => {
    if (props.alert) {
      let key = props.enqueueSnackbar('Parameter out of range: ' + props.path, {variant: 'error', preventDuplicate: true, persist: true})
      setAlertKey(key)
    }
    else {
      props.closeSnackbar(alertKey)
    }

  }, [props.alert])


  if (!props.isVisible) {
    return null
  }

  return (
    <Box pt='8px' borderTop={0.1} borderColor='#b5b5b5' key={props.path} height={rowHeight}>
      <Grid container spacing={1} alignItems="center" >
        <Grid container item xs={2}>
          <Box ml={2}>
            {Icon(props.data.type)}
          </Box>
        </Grid>

        <Grid container item xs={7} justifyContent='flex-start'>
          <Typography>{props.name}</Typography>
        </Grid>

        <Grid container item xs={3} justifyContent='center'>
          {Widget(props.data.type, props)}
        </Grid>
      </Grid>
    </Box>
  )
}

function mapStateToProps(state, ownProps){
  const data = state['parameters'][ownProps.path]
  const value = data.value
  return {
          data: data,
          value: value,
          alert: data.value < data.min || data.value > data.max
        }
}

export default withSnackbar(connect(mapStateToProps)(ParameterRow))