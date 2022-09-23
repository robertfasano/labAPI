import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { get, post } from './utilities.js'

function MonitorButton (props) {
    const checkMonitorStatus = ()  => {
        get('/monitor/status', (data) => {
            if (data) props.dispatch({type: 'monitor/start'})
            else props.dispatch({type: 'monitor/stop'})
        }
    )
    }

    React.useEffect(() => {
        // check whether monitor is running on first render
        checkMonitorStatus()   
    })
    React.useEffect(() => {
        // repeat check every 2 seconds
        const interval = setInterval(() => {
          checkMonitorStatus()
        }, 2000);
        return () => clearInterval(interval);
      }, []);

    const toggle = () => {
        if (props.paused) 
        {
            post('/monitor/resume', {})
            props.dispatch({type: 'monitor/start'})
        }
        else {
            post('/monitor/pause', {})
            props.dispatch({type: 'monitor/stop'})
        }
    }

  return (
    <Box mr={1} mt={0.5}>
        <Button onClick={toggle} style={{color: 'white'}}>
            {props.paused? <PlayArrowIcon/> : <PauseIcon/>}
        </Button>    
    </Box>
  )
}

MonitorButton.propTypes = {
    paused: PropTypes.bool
}

function mapStateToProps (state, ownProps) {
  return {
    paused: !state['monitor']['running']

  }
}

export default connect(mapStateToProps)(MonitorButton)
