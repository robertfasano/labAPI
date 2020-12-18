import React from 'react';
import { connect } from 'react-redux'
import IconButton from '@material-ui/core/IconButton';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import FolderOpenOutlinedIcon from '@material-ui/icons/FolderOpenOutlined';

import { get, post } from '../utilities.js'

function SaveLoadButtons(props) {

  const onInputClick = (event) => event.target.value = ''

  function uploadState(e) {
    const fileReader = new FileReader()
    fileReader.readAsText(e.target.files[0], 'UTF-8')
    fileReader.onload = e => {
      post("/parameters", {state: e.target.result}, (state) => {
        for (const [path, value] of Object.entries(state)) {
          props.dispatch({type: 'parameters/update', path, value})
        }
      })
    }
  }

  return (
    <React.Fragment>
      <IconButton href="/parameters" download='state.json' type='application/json' >
        <SaveOutlinedIcon/>
      </IconButton>
      <input
        accept="application/json"
        id="contained-button-file"
        type="file"
        style={{display: 'none'}}
        onChange={uploadState}
        onClick={onInputClick}
      />
      <label htmlFor="contained-button-file">
        <IconButton component="span">
          <FolderOpenOutlinedIcon />
        </IconButton>
      </label>
    </React.Fragment>
  )
}


export default connect()(SaveLoadButtons)
