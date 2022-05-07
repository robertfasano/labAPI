import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { post } from './utilities.js'

function MonitorButton (props) {
    const toggle = () => {
        if (props.paused) post('/monitor/resume', {})
        else post('/monitor/pause', {})
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
    paused: state['parameters']['labAPI/monitor/paused'].value

  }
}

export default connect(mapStateToProps)(MonitorButton)
