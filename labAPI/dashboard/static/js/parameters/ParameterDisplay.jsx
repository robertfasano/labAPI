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

function ParameterRow(props) {
  const rowHeight = '50px'
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
  if (props.data.type == 'switch') {
    function handleToggle(event) {
      event.stopPropagation()
      const newState = Boolean(1 - props.data.value)
      props.dispatch({type: 'parameters/update', path: props.path, value: newState})
      post('/parameters/' + props.path, {'value': newState})
    }
    return (
      <Box pt='8px' borderTop={0.1} borderColor='#b5b5b5' key={props.path} height={rowHeight}>
        <Grid container spacing={1} alignItems="center" >
          <Grid container item xs={2}>
            <Box ml={2}>
              <ToggleOnIcon size={20} sx={{color:'#8f8f8f'}}/>
            </Box>
          </Grid>

          <Grid container item xs={8} justifyContent='flex-start'>
            <Typography>{props.name}</Typography>
          </Grid>

          <Grid container item xs={2} justifyContent='center'>
            <Switch
              checked={props.data.value}
              onChange={(event) => handleToggle(event)}
            />
          </Grid>
        </Grid>
      </Box>

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

      <Box pt='8px' borderTop={0.1} borderColor='#b5b5b5' key={props.path} height={rowHeight}>
      <Grid container spacing={1} alignItems="center">
        <Grid container item xs={2}>
          <Box ml={2}>
            <ListIcon size={20} sx={{color:'#8f8f8f'}}/>
          </Box>
        </Grid>

        <Grid container item xs={6} justifyContent='flex-start'>
          <Typography>{props.name}</Typography>
        </Grid>

        <Grid container item xs={4} justifyContent='flex-end'>
          <Select value={props.data.value}
                  style={{width: 80}}
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
        </Grid>
      </Grid>
      </Box>
    )
  }

  if (props.data.type == 'knob') {
    function send(event) {
      const value = parseFloat(event.target.value)
      post('/parameters/' + props.path, {'value': value})
      props.dispatch({type: 'parameters/update', path: props.path, value: value})
    }

    return (
      <Box pt='8px' borderTop={0.1} borderColor='#b5b5b5' key={props.path} height={rowHeight}>
      <Grid container spacing={1} alignItems="center">
        <Grid container item xs={2}>
          <Box ml={2}>
            <TuneIcon size={20} sx={{color:'#8f8f8f'}}/>
          </Box>
        </Grid>

        <Grid container item xs={6} justifyContent='flex-start'>
          <Typography>{props.name}</Typography>
        </Grid>

        <Grid container item xs={4} justifyContent='flex-end'>
          <ValidatedInput placeholder={parseFloat((Number(props.data.value).toFixed(3)))}
                          min={props.data.min}
                          max={props.data.max}
                          onKeyPress={send}
          />
        </Grid>
      </Grid>
      </Box>
    )
  }

  if (props.data.type == 'function') {
    function send() {
      get('/functions/' + props.path)
    }

    return (
      <Box pt='8px' borderTop={0.1} borderColor='#b5b5b5' key={props.path} height={rowHeight}>
        <Grid container spacing={1} alignItems="center">
          <Grid container item xs={2}>
            <Box ml={2}>
              <CodeIcon size={20} sx={{color:'#8f8f8f'}}/>
            </Box>
          </Grid>

          <Grid container item xs={6} justifyContent='flex-start'>
            <Typography>{props.name}</Typography>
          </Grid>

          <Grid container item xs={4} justifyContent='flex-end'>
            <IconButton onClick={send}>
              <PlayArrowIcon/>
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    )
  }

  if (props.data.type == 'measurement') {
    let value = ''
    if (props.value != null) {
      value = props.value.toFixed(3)
    }

    return (
      <Box pt='8px' borderTop={0.1} borderColor='#b5b5b5' key={props.path} height={rowHeight}>
        <Grid container spacing={1} alignItems="center">
          <Grid container item xs={2}>
            <Box ml={2}>
              <ScienceIcon size={20} sx={{color:'#8f8f8f'}}/>
            </Box>
          </Grid>

          <Grid container item xs={6} justifyContent='flex-start'>
            <Typography>{props.name}</Typography>
          </Grid>

          <Grid container item xs={4} justifyContent='flex-end'>
            <TextField value={value}
                      InputProps={{style: {color: props.alert? '#FF0000': "rgba(0, 0, 0, 0.38)"}}}
                      error={props.alert}
                      style={{width: 100}}
                      variant='standard'
            />
            {/* <TextField value={value}/> */}
          </Grid>
        </Grid>
      </Box>
    )
  }

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
// export default connect(mapStateToProps)(ParameterRow)