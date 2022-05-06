import React from 'react'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import PauseIcon from '@material-ui/icons/Pause'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
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
