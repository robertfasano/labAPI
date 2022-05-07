import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Popover from '@material-ui/core/Popover'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
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
