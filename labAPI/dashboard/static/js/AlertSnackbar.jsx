import React from 'react'
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { connect } from 'react-redux'

function AlertSnackbar({dispatch, open, severity, text}){
  function handleClose() {
    dispatch({type: 'alert/hide'})
  }
  return (
    <Snackbar open={open}
              autoHideDuration={6000}
              onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity}>
        {text}
      </Alert>
    </Snackbar>
  )
}

function mapStateToProps(state){
  return {open: state['alert']['open'],
          severity: state['alert']['severity'],
          text: state['alert']['text']
        }
}

export default connect(mapStateToProps)(AlertSnackbar)
