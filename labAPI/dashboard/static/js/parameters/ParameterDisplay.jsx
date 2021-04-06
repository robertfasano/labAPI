import React from 'react';
import Box from "@material-ui/core/Box";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
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
import { useSnackbar, withSnackbar } from 'notistack';

import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles({
  root: {
    "&:hover": {backgroundColor: '#dbdbdb'},
  },
});

function ParameterRow(props) {
  const classes = useStyles()
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
      <Box py={0.5} mx={2} width={1} borderTop={0.1} borderColor='#b5b5b5' className={classes.root} key={props.path}>
      <Grid container spacing={1} alignItems="center" >
        <Grid container item xs={2}>
          <Box ml={2}>
            <BsToggleOn size={20} color='#8f8f8f'/>
          </Box>
        </Grid>

        <Grid container item xs={8} justify='flex-start'>
          <Typography>{props.name}</Typography>
        </Grid>

        <Grid container item xs={2} justify='center'>
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

      <Box py={0.5} mx={2} width={1} borderTop={0.1} borderColor='#b5b5b5' className={classes.root} key={props.path}>
      <Grid container spacing={1} alignItems="center">
        <Grid container item xs={2}>
          <Box ml={2}>
            <HiSelector size={20} color='#8f8f8f'/>
          </Box>
        </Grid>

        <Grid container item xs={6} justify='flex-start'>
          <Typography>{props.name}</Typography>
        </Grid>

        <Grid container item xs={4} justify='flex-end'>
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
        </Grid>
      </Grid>
      </Box>
    )
  }


  if (props.data.type == 'knob') {
    function send(event) {
      const value = event.target.value
      post('/parameters/' + props.path, {'value': value})
      props.dispatch({type: 'parameters/update', path: props.path, value: value})
    }

    return (
      <Box py={0.5} mx={2} width={1} borderTop={0.1} borderColor='#b5b5b5' className={classes.root} key={props.path}>
      <Grid container spacing={1} alignItems="center">
        <Grid container item xs={2}>
          <Box ml={2}>
            <GiRoundKnob size={20} color='#8f8f8f'/>
          </Box>
        </Grid>

        <Grid container item xs={6} justify='flex-start'>
          <Typography>{props.name}</Typography>
        </Grid>

        <Grid container item xs={4} justify='flex-end'>
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

  if (props.data.type == 'measurement') {
    let value = ''
    if (props.value != null) {
      value = props.value.toFixed(3)
    }

    function updateUnit(event) {
      props.dispatch({type: 'parameters/setUnit', path: props.path, value: event.target.value})
    }

    return (
      <Box py={0} mx={2} width={1} borderTop={0.1} borderColor='#b5b5b5' className={classes.root} key={props.path}>
      <Grid container spacing={1} alignItems="center">
        <Grid container item xs={2}>
          <Box ml={2}>
            <AiTwotoneExperiment size={20} color='#8f8f8f'/>
          </Box>
        </Grid>

        <Grid container item xs={5} justify='flex-start'>
          <Typography>{props.name}</Typography>
        </Grid>

        <Grid container item xs={1} justify='flex-end'>
          <IconButton onClick={() => props.dispatch({type: 'plotting/toggle', path: props.path})} color={props.plotted? 'primary': 'default'}>
            <TimelineIcon/>
          </IconButton>
        </Grid>

        <Grid container item xs={1} justify='flex-end'>
        {Object.keys(props.data.value).length > 1? (
          <Select value={props.data.unit}
                  style={{width: 100}}
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
        </Grid>
        <Grid container item xs={3} justify='flex-end'>
          <TextField value={value}
                     InputProps={{style: {color: props.alert? '#FF0000': "rgba(0, 0, 0, 0.38)"}}}
                     error={props.alert}
          />
        </Grid>
      </Grid>
      </Box>
    )
  }

}

function mapStateToProps(state, ownProps){
  let data = state['parameters'][ownProps.path]
  return {
          data: data,
          value: data.value[data.unit],
          plotted: Object.keys(state['plotting'].data).includes(ownProps.path),
          alert: data.value[data.unit] < data.min || data.value[data.unit] > data.max

        }
}

export default withSnackbar(connect(mapStateToProps)(ParameterRow))
