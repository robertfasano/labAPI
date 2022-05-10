import React from 'react'
import Box from '@mui/material/Box'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

function Heartbeat (props) {

  return (
      <Box mr={1} mt={0.5}>
        {props.heartbeat ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
      </Box>
  )
}

Heartbeat.propTypes = {
  heartbeat: PropTypes.bool,
}

function mapStateToProps (state, ownProps) {
  return {
    heartbeat: state.ui.heartbeat
  }
}

export default connect(mapStateToProps)(Heartbeat)
