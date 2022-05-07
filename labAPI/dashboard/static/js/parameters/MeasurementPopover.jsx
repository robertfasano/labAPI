import React from 'react'
import PropTypes from 'prop-types'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { connect } from 'react-redux'
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

function MeasurementPopover (props) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  return (
      <>
      <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
        <BrokenImageIcon/>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={(event) => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
          <Box m={1}>
            <TextField value={props.data.min} />
          </Box>
          <Box m={1}>
            <TextField value={props.data.max} />
          </Box>
      </Popover>
      </>
  )
}

function mapStateToProps (state, props) {
  return {
    data: props.data
  }
}

export default connect(mapStateToProps)(MeasurementPopover)
